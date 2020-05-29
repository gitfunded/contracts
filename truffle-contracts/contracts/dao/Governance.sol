pragma solidity >=0.5.0 < 0.6.0;

import "./oz/SafeMath.sol";
import "./oz/IERC20.sol";
import "./oz/ReentrancyGuard.sol";
import "./GuildBank.sol";

contract Governance is ReentrancyGuard {
    using SafeMath for uint256;

    /***************
    GLOBAL CONSTANTS
    ***************/
    address public admin; // initial singular shareholder, assists with bailouts

    uint256 public periodDuration; // default = 17280 = 4.8 hours in seconds (5 periods per day)
    uint256 public votingPeriodLength; // default = 35 periods (7 days)
    uint256 public summoningTime; // needed to determine the current period

    IERC20 public depositToken; // deposit token contract reference; default = wETH
    GuildBank public guildBank; // guild bank contract reference

    // HARD-CODED LIMITS
    // These numbers are quite arbitrary; they are small enough to avoid overflows when doing calculations
    // with periods or shares, yet big enough to not limit reasonable use cases.
    uint256 constant MAX_VOTING_PERIOD_LENGTH = 10**18; // maximum length of voting period
    uint256 constant MAX_NUMBER_OF_SHARES = 10**18; // maximum number of shares that can be minted

    // ***************
    // EVENTS
    // ***************
    event SubmitProposal(uint256 proposalId, address indexed memberAddress, uint256 sharesRequested, uint256 tributeOffered, address tributeToken, uint256 paymentRequested, address paymentToken);
    event SubmitVote(uint256 indexed proposalId, address indexed memberAddress, uint8 uintVote);
    event ProcessProposal(uint256 indexed proposalId, bool didPass);
    event CancelProposal(uint256 indexed proposalIndex, address applicantAddress);
    event SummonComplete(address indexed admin, uint256 shares);

    // *******************
    // INTERNAL ACCOUNTING
    // *******************
    uint256 public proposalCount = 0; // total proposals submitted
    uint256 public totalShares = 0; // total shares across all members
    uint256 public result;

    // uint256 public lastEmergencyProposalIndex = 0; // index of the last proposal which triggered emergency processing

    enum Vote {
        Null, // default value, counted as abstention
        Yes,
        No
    }

    enum Role {
    Admin,
    Shareholder,
    Contributor
    }

    struct Member {
        address delegateKey; // the key responsible for submitting proposals and voting - defaults to member address unless updated
        uint256 shares; // the # of voting shares assigned to this member
        bool exists; // always true once a member has been created
        Role role;//defines current role of the member
    }

    struct Proposal {
        address proposer; // the account that submitted the proposal (can be non-member)
        uint256 sharesRequested; // the # of shares the applicant is requesting
        uint256 tributeOffered; // amount of tokens offered as tribute
        IERC20  tributeToken; // tribute token contract reference
        uint256 paymentRequested; // amount of tokens requested as payment
        IERC20  paymentToken; // payment token contract reference
        uint256 startingPeriod; // the period in which voting can start for this proposal
        uint256 yesVotes; // the total number of YES votes for this proposal
        uint256 noVotes; // the total number of NO votes for this proposal
        bool[3] flags; // [processed, didPass, cancelled]
        string details; // proposal details - could be IPFS hash, plaintext, or JSON
        mapping(address => Vote) votesByMember; // the votes on this proposal by each member
    }

    IERC20[] public approvedTokens;

    mapping(address => Member) public members;

    mapping(uint256 => Proposal) public proposals;

    uint256[] public proposalQueue;

    modifier onlyMember {
        require(members[msg.sender].shares >= 0 , "not a member");
        _;
    }

    modifier onlyShareholder {
        require(members[msg.sender].shares > 0, "not a shareholder");
        _;
    }

    constructor(
        address _admin,
        address[1] memory _approvedTokens,
        uint256 _periodDuration,
        uint256 _votingPeriodLength
    ) public {
        require(_admin != address(0), "admin cannot be 0");
        require(_periodDuration > 0, "_periodDuration cannot be 0");
        require(_votingPeriodLength > 0, "_votingPeriodLength cannot be 0");
        require(_votingPeriodLength <= MAX_VOTING_PERIOD_LENGTH, "_votingPeriodLength exceeds limit");
        require(_approvedTokens.length > 0, "need at least one approved token");

        admin = _admin;

        depositToken = IERC20(_approvedTokens[0]);

        for (uint256 i = 0; i < _approvedTokens.length; i++) {
            require(_approvedTokens[i] != address(0), "_approvedToken cannot be 0");
            approvedTokens.push(IERC20(_approvedTokens[i]));
        }

        guildBank = new GuildBank();

        periodDuration = _periodDuration;
        votingPeriodLength = _votingPeriodLength;

        summoningTime = now;

        members[admin] = Member(admin, 1, true, Role.Admin);
        totalShares = 1;

        emit SummonComplete(admin, 1);
    }

    /*****************
    PROPOSAL FUNCTIONS
    *****************/
    function addContibutor() public nonReentrant {
        members[msg.sender]=Member(msg.sender,0,true,Role.Contributor);             
    }

    function donate (uint256 tributeOffered, address tributeToken) public nonReentrant {
        require(IERC20(tributeToken).transferFrom(msg.sender, address(guildBank), tributeOffered), "tribute token transfer failed");
        
    }
    
    
    function submitProposal(
        uint256 sharesRequested,
        uint256 tributeOffered,
        address tributeToken,
        uint256 paymentRequested,
        address paymentToken,
        string memory details
    ) public nonReentrant returns (uint256 proposalId) {

        require(sharesRequested <= MAX_NUMBER_OF_SHARES, "too many shares requested");

        // collect tribute from proposer and store it in the Moloch until the proposal is processed
        require(IERC20(tributeToken).transferFrom(msg.sender, address(this), tributeOffered), "tribute token transfer failed");

        bool[3] memory flags; // [processed, didPass, cancelled]

        _submitProposal(sharesRequested, tributeOffered, tributeToken, paymentRequested, paymentToken, details, flags);
        return proposalCount - 1; // return proposalId - contracts calling submit might want it
    }

    function _submitProposal(
        uint256 sharesRequested,
        uint256 tributeOffered,
        address tributeToken,
        uint256 paymentRequested,
        address paymentToken,
        string memory details,
        bool[3] memory flags
    ) internal {
        Proposal memory proposal = Proposal({
            proposer : msg.sender,
            sharesRequested : sharesRequested,
            tributeOffered : tributeOffered,
            tributeToken : IERC20(tributeToken),
            paymentRequested : paymentRequested,
            paymentToken : IERC20(paymentToken),
            startingPeriod : 0,
            yesVotes : 0,
            noVotes : 0,
            flags : flags,
            details : details
        });

        proposals[proposalCount] = proposal;
        emit SubmitProposal(proposalCount, msg.sender, sharesRequested, tributeOffered, tributeToken, paymentRequested, paymentToken);
        proposalCount += 1;
    }

    function submitVote(uint256 proposalId, uint8 uintVote) public nonReentrant onlyShareholder {
        Member storage member = members[msg.sender];

        require (member.role == Role.Shareholder || member.role == Role.Admin, "Contributors cannot vote");
        
        require(proposalId < proposalCount, "proposal does not exist");
        Proposal storage proposal = proposals[proposalId];

        require(uintVote < 3, "must be less than 3");
        Vote vote = Vote(uintVote);

        require(getCurrentPeriod() >= proposal.startingPeriod, "voting period has not started");
        require(!hasVotingPeriodExpired(proposal.startingPeriod), "proposal voting period has expired");
        require(proposal.votesByMember[msg.sender] == Vote.Null, "member has already voted");
        require(vote == Vote.Yes || vote == Vote.No, "vote must be either Yes or No");

        proposal.votesByMember[msg.sender] = vote;

        if (vote == Vote.Yes) {
            proposal.yesVotes = proposal.yesVotes.add(member.shares);

        } else if (vote == Vote.No) {
            proposal.noVotes = proposal.noVotes.add(member.shares);
        }

        emit SubmitVote(proposalId, msg.sender, uintVote);
    }

   function processProposal(uint256 proposalId) public nonReentrant {
       _validateProposalForProcessing(proposalId);

       Proposal storage proposal = proposals[proposalId];

       proposal.flags[0] = true; // processed

       bool didPass = _didPass(proposalId);

        if (totalShares.add(proposal.sharesRequested) > MAX_NUMBER_OF_SHARES) {
            didPass = false;
        }


       //Make the proposal fail if it is requesting more tokens as payment than the available guild bank balance
       if (proposal.paymentToken != IERC20(0) && proposal.paymentRequested > proposal.paymentToken.balanceOf(address(guildBank))) {
           didPass = false;
       }

       // PROPOSAL PASSED
       if (didPass) {

           result=1;
           proposal.flags[1] = true; // didPass

           members[proposal.proposer].shares = members[proposal.proposer].shares.add(proposal.sharesRequested);
           if(proposal.sharesRequested > 0)
           {
            members[proposal.proposer].role =Role.Shareholder;
           }   

           // mint new shares & loot
           totalShares = totalShares.add(proposal.sharesRequested);


           require(
               proposal.tributeToken.transfer(address(guildBank), proposal.tributeOffered),
               "token transfer to guild bank failed"
           );

           require(
               guildBank.withdrawToken(proposal.paymentToken, proposal.proposer, proposal.paymentRequested),
               "token payment to applicant failed"
           );


       // PROPOSAL FAILED
       } else {

            result=2;
           // return all tokens to the applicant
           require(
                proposal.tributeToken.transfer(proposal.proposer, proposal.tributeOffered),"failing vote token transfer failed");
           
       }

       emit ProcessProposal(proposalId, didPass);
   }


    function _didPass(uint256 proposalId) internal returns (bool didPass) {
        Proposal memory proposal = proposals[proposalId];

        didPass = proposal.yesVotes > proposal.noVotes;

        return didPass;
    }

    function _validateProposalForProcessing(uint256 proposalId) internal view {
        require(proposalId < proposalCount, "proposal does not exist");
        Proposal memory proposal = proposals[proposalId];

        require(getCurrentPeriod() >= proposal.startingPeriod.add(votingPeriodLength), "proposal is not ready to be processed");
        require(proposal.flags[0] == false, "proposal has already been processed");
        require(proposalId == 0 || proposals[proposalId.sub(1)].flags[0], "previous proposal must be processed");
    }

   function cancelProposal(uint256 proposalId) public nonReentrant {
       Proposal storage proposal = proposals[proposalId];
       require(!proposal.flags[2], "proposal has already been cancelled");
       require(msg.sender == proposal.proposer, "solely the proposer can cancel");

       proposal.flags[2] = true; // cancelled

       require(
           proposal.tributeToken.transfer(proposal.proposer, proposal.tributeOffered),
           "failed to return tribute to proposer"
       );

       emit CancelProposal(proposalId, msg.sender);
   }

   /***************
   GETTER FUNCTIONS
   ***************/
    function max(uint256 x, uint256 y) internal pure returns (uint256) {
        return x >= y ? x : y;
    }

    function getCurrentPeriod() public view returns (uint256) {
        return now.sub(summoningTime).div(periodDuration);
    }

   function getProposalFlags(uint256 proposalId) public view returns (bool[3] memory) {
       return proposals[proposalId].flags;
   }

    function hasVotingPeriodExpired(uint256 startingPeriod) public view returns (bool) {
        return getCurrentPeriod() >= startingPeriod.add(votingPeriodLength);
    }

   function getMemberProposalVote(address memberAddress, uint256 proposalId) public view returns (Vote) {
       require(members[memberAddress].exists, "member does not exist");
       require(proposalId < proposalCount, "proposal does not exist");
       return proposals[proposalId].votesByMember[memberAddress];
   }
    function getProposal ()  public view returns(uint256){
        return proposalCount;
    }
    function getResult ()  public view returns(uint256){
        return result;//checks proposal passed or not
    }
}
