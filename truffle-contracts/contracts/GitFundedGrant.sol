pragma solidity ^0.5.0;

contract GitFundedGrant {


  // New project structure
  struct Project {
    string repoId;
    string title;
    uint budget; // In dollars
    uint availableFund; // In Ether
    address owner;
  }

  event projectAdded (
    string repoId,
    string title,
    uint budget, // In dollars
    uint availableFund, // In Ether
    address owner

    );

  Project[] public projects;
  address internal owner;

  constructor() public {
    owner = msg.sender;
  }

  modifier onlyOwner  {
      require(msg.sender == owner);
      _;
  }

  modifier onlyProjectOwner(uint projectId)  {
        require(msg.sender == projects[projectId].owner);
      _;
    }

  function destroy() public onlyOwner {
//        selfdestruct(address owner);
    }

  function fetchProject(uint projectId) view public returns (string memory, string memory, uint, uint, address) {

    Project memory project = projects[projectId];

    return (project.repoId, project.title, project.budget, project.availableFund, project.owner);
  }

  function addProject(string memory repoId, string memory title, uint budget) public {

    Project memory project =  Project(repoId, title, budget, 0, msg.sender);

    projects.push(project);

    emit projectAdded(repoId, title, budget, 0, msg.sender);

  }


  function fundProject(uint projectId) payable public {

    projects[projectId].availableFund += msg.value;


  }

  function transferFund(uint projectId, address payable recipient, uint value) onlyProjectOwner(projectId) payable public {

    recipient.transfer(value);


  }

  function getProjectsCount() public view returns (uint) {
    return projects.length;
  }

}
