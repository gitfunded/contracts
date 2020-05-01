pragma solidity >=0.5.0 < 0.6.0;
import "./dao/oz/SafeMath.sol";
import './bounties/iBountiesMetaTxRelayer.sol';
import './dao/iGovernance.sol';
import './dao/Governance.sol';

contract GitFundedGrant is Governance{


    uint public version = 1;
    uint public minorVersion = 1;
    uint public contractStartTime;

    bool public active = true;
    uint public totalCurrentMembers = 0;
    iGovernance ig;
    iBountiesMetaTxRelayer ib;


  constructor(string memory i_repoId, string memory i_title, uint i_budget, address payable i_admin, address i_bountyAddress, address i_tokenAddress)
  public
   Governance(i_admin, [i_tokenAddress], 17280, 35, 35, 35, 70, 10, 3, 1)
  {

    repoId = i_repoId;
    title = i_title;
    budget = i_budget;
    admin = i_admin;
    availableFund = 0;
    live = true;

    //bountiesContract = BountiesMetaTxRelayer(i_bountyAddress);
    ib=iBountiesMetaTxRelayer(i_bountyAddress);
    tokenAddress = tokenAddress;

    contractStartTime = now;

  }

  using SafeMath for uint256;


  enum ExpenseStatus {
    PENDING,
    PARTIALLY_ACCEPTED,
    ACCEPTED,
    REJECTED
  }

  enum IssueStatus {
    BACKLOG,
    TODO,
    DOING,
    DONE,
    REJECTED
  }

  /*
  * Admin: Project initiator. New admins can be added by the existing ones
  * Member: Any funder and initial contributors will be the project members
  * Contributor: Direct project contributors or can be added by other project members
  */
  enum Role {
    ADMIN,
    MEMBER,
    CONTRIBUTOR

  }

  // Stores details of different types of users: Admin/ Member/ Contributor
  struct User {
    bool exists;
    address delegateKey;
    uint balance;
    uint256 shares;
    Role role;
  }


  // New expense structure
  //  TODO: The expense amount should be maintained in dollar
  struct Expense {
    string title;
    uint amount; // In Ether
    uint allocated; // In Ether
    address payable recipient;
    ExpenseStatus status;
    uint proposalIndex;
  }

  // New issue structure
  //  TODO: The issue amount should be maintained in dollar
  struct Issue {
    string title;
    uint amount; // In Ether
    uint allocated; // In Ether
    address payable recipient;
    IssueStatus status;
  }


  Expense[] public expenses;
  Issue[] public issues;

  mapping(address => User) public users;

  address payable public admin;
  string public repoId;
  string public title;
  uint budget; // In dollars
  uint availableFund; // In Ether
  bool live;
  //BountiesMetaTxRelayer public bountiesContract;
  address tokenAddress;

  modifier onlyAdmin  {
      require(msg.sender == admin, "Not Authorised");
      _;
  }

  modifier onlyWhenActive() {
    require(active, "Project is not active");
    _;
  }


  function destroy() public onlyAdmin {
        selfdestruct(admin);
    }

  function fetchProject() view public returns (string memory, string memory, uint, uint, address) {

    return (repoId, title, budget, availableFund, admin);
  }

        // address applicant,
        // uint256 sharesRequested,
        // uint256 lootRequested,
        // uint256 tributeOffered,
        // address tributeToken,
        // uint256 paymentRequested,
        // address paymentToken,
        // string memory details
  function addExpense(string memory _title, uint _amount, address applicant, uint sharesRequested, uint lootRequested, uint tributeOffered,
                      address tributeToken, uint paymentRequested, address paymentToken, string memory details) public {

    Expense memory expense = Expense(_title, _amount, 0, msg.sender, ExpenseStatus.PENDING,0);
    expenses.push(expense);
    submitProposal(applicant,sharesRequested,lootRequested,tributeOffered,tributeToken,paymentRequested,paymentToken,details);

  }

  function acceptExpense(uint expenseIndex) onlyAdmin public {

    // uint index=expenses[expenseIndex].proposalIndex;
    // Proposal storage proposal = proposals[proposalQueue[index]];
    // require (proposal.flags[2]==true,"Proposal not passed");
    

    uint amount = expenses[expenseIndex].amount;
    require(expenses[expenseIndex].status == ExpenseStatus.PENDING);
    require(availableFund >= amount, "Funds not available");


    expenses[expenseIndex].status = ExpenseStatus.ACCEPTED;
    availableFund -= amount;
    expenses[expenseIndex].allocated =  amount;
    expenses[expenseIndex].recipient.transfer(amount);

  }
  function sponsorExpense (uint expenseIndex) public {
    expenses[expenseIndex].proposalIndex =  sponsorProposal(expenseIndex);
  }
  

  // TODO: Merge this logic with the acceptExpense by overloading the function
  function acceptPartialExpense(uint expenseIndex, uint amount) onlyAdmin public {

    require(expenses[expenseIndex].status == ExpenseStatus.PENDING);
    require(availableFund >= amount, "Funds not available");


    expenses[expenseIndex].status = ExpenseStatus.PARTIALLY_ACCEPTED;
    availableFund -= amount;
    expenses[expenseIndex].allocated =  amount;
    expenses[expenseIndex].recipient.transfer(amount);


  }


  function fundProject() payable public {

    availableFund = availableFund.add(msg.value);


  }

  function transferFund(address payable recipient, uint value) onlyAdmin payable public {

    availableFund = availableFund.sub(value);
    recipient.transfer(value);


  }


  function getExpensesCount() public view returns (uint) {
    return expenses.length;
  }

  function getIssuesCount() public view returns (uint) {
    return issues.length;
  }


  // Bounties related methods are called for Issues


  //TODO: Modify the Issue struct to store more bounty details
    function addIssue(string memory _title, uint _amount) public {

        Issue memory issue = Issue(_title, _amount, 0, msg.sender, IssueStatus.BACKLOG);
        issues.push(issue);

    }
  // A bounty will be created without funding
    function acceptIssueWithNoFund(uint issueIndex,
            bytes memory signature,
            address payable[] memory _issuers,
            address[] memory _approvers,
            string memory _data,
            uint _deadline,
            address _token,
            uint _tokenVersion,
            uint _nonce) onlyAdmin public {

        uint amount = issues[issueIndex].amount;
        require(issues[issueIndex].status == IssueStatus.BACKLOG);
        require(availableFund >= amount, "Funds not available");


        issues[issueIndex].status = IssueStatus.TODO;
        availableFund -= amount;
        issues[issueIndex].allocated =  amount;

        // bountiesContract.metaIssueBounty(signature, _issuers,
        //     _approvers, _data, _deadline, _token, _tokenVersion, _nonce);
                ib.metaIssueBounty(signature, _issuers,
            _approvers, _data, _deadline, _token, _tokenVersion, _nonce);

    }


 // A bounty will be created by funding it with the existing grant amount
  function acceptIssue(uint issueIndex,
    bytes memory signature,
    address payable[] memory _issuers,
    address[] memory _approvers,
    string memory _data,
    uint _deadline,
    address _token,
    uint _tokenVersion,
    uint _depositAmount,
    uint _nonce) onlyAdmin public payable {

    uint amount = issues[issueIndex].amount;
    require(issues[issueIndex].status == IssueStatus.BACKLOG);
    require(availableFund >= amount, "Funds not available");


    issues[issueIndex].status = IssueStatus.TODO;
    availableFund -= amount;
    issues[issueIndex].allocated =  amount;
    ib.metaIssueAndContribute.value(amount)(signature, _issuers,
      _approvers, _data, _deadline, _token, _tokenVersion, _depositAmount, _nonce);

  }

  function swipe(address payable recipient) external onlyAdmin {

    recipient.transfer(address(this).balance);
  }
 }
