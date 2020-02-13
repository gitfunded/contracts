pragma solidity >=0.5.0 < 0.6.0;
import './GitFundedGrant.sol';

contract GitFundedGrantFactory {
  uint public projectCount = 0;
  address bountyAddress; // This is actually BountiesMetaTxRelayer address
  mapping(address => address[]) public projects;

  constructor(address i_bountyAddress) public {

    bountyAddress = i_bountyAddress;


  }


  event projectAdded (
        string repoId,
        string title,
        uint budget, // In dollars
        uint availableFund, // In Ether
        address admin

  );

  function newProject(
    string memory repoId, string memory title, uint budget) public returns (address) {

    GitFundedGrant project = new GitFundedGrant(
      repoId,
      title,
      budget,
      msg.sender,
      bountyAddress
    );

    projects[msg.sender].push(address(project));
    projectCount += 1;

    emit projectAdded(repoId, title, budget, 0, msg.sender);

    return address(project);
  }

  function getContractAddress() public view returns (address[] memory) {
    return projects[msg.sender];
  }

  function getProjectsCount() public view returns (uint) {
    return projectCount;
  }
}
