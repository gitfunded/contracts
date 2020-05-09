pragma solidity >=0.5.0 < 0.7.0;
import './voting.sol';

contract votingFactory {

  uint public votingCount = 0;
  //address tokenAddress;
  mapping(address => address[]) public voteMap;


  function newVoting() public returns (address) {

    voting vot=new voting();

    voteMap[msg.sender].push(address(vot));
    votingCount += 1;

    return address(vot);
  }

  function getContractAddress() public view returns (address[] memory) {
    return voteMap[msg.sender];
  }

  function getVotingCount() public view returns (uint) {
    return votingCount;
  }
}
