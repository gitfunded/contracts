pragma solidity >=0.5.0 < 0.7.0;

import "./SafeMath.sol";

contract voting
{

	string private constant ERROR_NO_VOTE = "VOTING_NO_VOTE";
    string private constant ERROR_INIT_PCTS = "VOTING_INIT_PCTS";
    string private constant ERROR_CHANGE_SUPPORT_PCTS = "VOTING_CHANGE_SUPPORT_PCTS";
    string private constant ERROR_CHANGE_QUORUM_PCTS = "VOTING_CHANGE_QUORUM_PCTS";
    string private constant ERROR_INIT_SUPPORT_TOO_BIG = "VOTING_INIT_SUPPORT_TOO_BIG";
    string private constant ERROR_CHANGE_SUPPORT_TOO_BIG = "VOTING_CHANGE_SUPP_TOO_BIG";
    string private constant ERROR_CAN_NOT_VOTE = "VOTING_CAN_NOT_VOTE";
     string private constant ERROR_CAN_NOT_EXECUTE = "VOTING_CAN_NOT_EXECUTE";
    string private constant ERROR_CAN_NOT_FORWARD = "VOTING_CAN_NOT_FORWARD";
    string private constant ERROR_NO_VOTING_POWER = "VOTING_NO_VOTING_POWER";

	enum VoterState { Absent, Yea, Nay }

	//uint256 public constant PCT_BASE = 10 ** 18; // 0% = 0; 1% = 10^16; 100% = 10^18

    using SafeMath for uint256;

	struct Vote {
        bool executed;
        uint256 startDate;
        uint256 snapshotBlock;
        uint256 supportRequiredPct;
        uint256 minAcceptQuorumPct;
        uint256 votingPower;
        uint256 yea;
        uint256 nay;
        mapping (address => VoterState) voters;
    }

    uint256 public supportRequiredPct;
    uint256 public minAcceptQuorumPct;
    uint256 public voteTime;

    modifier voteExists(uint256 _voteId) {
        require(_voteId < votesLength, ERROR_NO_VOTE);
        _;
    }

    mapping (uint256 => Vote) internal votes;
    uint256 public votesLength;

    function initialize( uint256 _supportRequiredPct, uint256 _minAcceptQuorumPct, uint256 _voteTime) external {
        require(_minAcceptQuorumPct <= _supportRequiredPct, ERROR_INIT_PCTS);
        // require(_supportRequiredPct < PCT_BASE, ERROR_INIT_SUPPORT_TOO_BIG);
        supportRequiredPct = _supportRequiredPct;
        minAcceptQuorumPct = _minAcceptQuorumPct;
        voteTime = _voteTime;
    }

    function changeSupportRequiredPct(uint256 _supportRequiredPct)
        external
    {
        require(minAcceptQuorumPct <= _supportRequiredPct, ERROR_CHANGE_SUPPORT_PCTS);
        //require(_supportRequiredPct < PCT_BASE, ERROR_CHANGE_SUPPORT_TOO_BIG);
        supportRequiredPct = _supportRequiredPct;
    }

    function changeMinAcceptQuorumPct(uint256 _minAcceptQuorumPct)
        external
    {
        require(_minAcceptQuorumPct <= supportRequiredPct, ERROR_CHANGE_QUORUM_PCTS);
        minAcceptQuorumPct = _minAcceptQuorumPct;
    }

    function newVote(bool _castVote, bool _executesIfDecided)
        external returns (uint256 voteId)
    {
        return _newVote(_castVote, _executesIfDecided);
    }

    function _newVote(bool _castVote, bool _executesIfDecided) internal returns (uint256 voteId) {
        uint256 snapshotBlock = uint256(block.number - 1); // avoid double voting in this very block

        voteId = votesLength++;
        // require(votingPower > 0, ERROR_NO_VOTING_POWER);
        Vote storage vote_ = votes[voteId];
        vote_.startDate = uint256(block.timestamp);
        vote_.snapshotBlock = snapshotBlock;
        vote_.supportRequiredPct = supportRequiredPct;
        vote_.minAcceptQuorumPct = minAcceptQuorumPct;
        vote_.executed=false;
        // vote_.votingPower=?;

        if (_castVote && _canVote(voteId, msg.sender)) {
            _vote(voteId, true, msg.sender, _executesIfDecided);
        }
    }

    function vote(uint256 _voteId, bool _supports, bool _executesIfDecided) external voteExists(_voteId) {
        require(_canVote(_voteId, msg.sender), ERROR_CAN_NOT_VOTE);
        _vote(_voteId, _supports, msg.sender, _executesIfDecided);
    }

    function canVote(uint256 _voteId, address _voter) public view voteExists(_voteId) returns (bool) {
        return _canVote(_voteId, _voter);
    }

    //add voting power parameter
    function getVote(uint256 _voteId)
        public
        view
        voteExists(_voteId)
        returns (
            bool open,
            bool executed,
            uint256 startDate,
            uint256 snapshotBlock,
            uint256 supportRequired,
            uint256 minAcceptQuorum,
            uint256 yea,
            uint256 nay
        )
    {
        Vote storage vote_ = votes[_voteId];

        open = _isVoteOpen(vote_);
        executed = vote_.executed;
        startDate = vote_.startDate;
        snapshotBlock = vote_.snapshotBlock;
        supportRequired = vote_.supportRequiredPct;
        minAcceptQuorum = vote_.minAcceptQuorumPct;
        yea = vote_.yea;
        nay = vote_.nay;
    }

    function getVoterState(uint256 _voteId, address _voter) public view voteExists(_voteId) returns (VoterState) {
        return votes[_voteId].voters[_voter];
    }

    function _vote(uint256 _voteId, bool _supports, address _voter, bool _executesIfDecided) internal {
        Vote storage vote_ = votes[_voteId];

        // This could re-enter, though we can assume the governance token is not malicious
        uint256 voterStake=?
        VoterState state = vote_.voters[_voter];
        // If voter had previously voted, decrease count
        // if (state == VoterState.Yea) {
        //     vote_.yea = vote_.yea.sub(voterStake);
        // } else if (state == VoterState.Nay) {
        //     vote_.nay = vote_.nay.sub(voterStake);
        // }

        if (_supports) {
            vote_.yea = vote_.yea.add(voterStake);
        } else {
            vote_.nay = vote_.nay.add(voterStake);
        }

        vote_.voters[_voter] = _supports ? VoterState.Yea : VoterState.Nay;

        if (_executesIfDecided && _canExecute(_voteId)) {
            // We've already checked if the vote can be executed with `_canExecute()`
            _unsafeExecuteVote(_voteId);
        }

    }

    function _canVote(uint256 _voteId, address _voter) internal view returns (bool) {
        Vote storage vote_ = votes[_voteId];
        // return _isVoteOpen(vote_);
        return true;
    }

    function _isVoteOpen(Vote storage vote_) internal view returns (bool) {
        // return uint256(block.timestamp) < vote_.startDate.add(voteTime) && !vote_.executed;
        return false;
    }

    function _isValuePct(uint256 _value, uint256 _total, uint256 _pct) internal pure returns (bool) {
        if (_total == 0) {
            return false;
        }

        uint256 computedPct = _value / _total;
        return computedPct > _pct;
    }

    function _canExecute(uint256 _voteId) internal view returns (bool) {
        Vote storage vote_ = votes[_voteId];

        if (vote_.executed) {
            return false;
        }

        // Voting is already decided
        if (_isValuePct(vote_.yea, 5, vote_.supportRequiredPct)) {
            return true;
        }

        // Vote ended/
        // if (_isVoteOpen(vote_)) {
        //     return false;
        // }
        // Has enough support?
        uint256 totalVotes = vote_.yea.add(vote_.nay);
        if (!_isValuePct(vote_.yea, totalVotes, vote_.supportRequiredPct)) {
            return false;
        }
        // Has min quorum?
        if (!_isValuePct(totalVotes, 5, vote_.minAcceptQuorumPct)) {
            return false;
        }

        return true;
    }

    function _unsafeExecuteVote(uint256 _voteId) internal {
        Vote storage vote_ = votes[_voteId];

        vote_.executed = true;
    }

    function exec(uint256 _voteId) external view returns (bool) {
        Vote memory vote_ = votes[_voteId];

        return vote_.executed;
    }


}