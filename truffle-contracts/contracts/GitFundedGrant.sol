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


  Project[] public projects;

  function fetchProject(uint projectId) view public returns (string memory, string memory, uint, uint, address) {

    Project memory project = projects[projectId];

    return (project.repoId, project.title, project.budget, project.availableFund, project.owner);
  }

  function addProject(string memory repoId, string memory title, uint budget) public {

    Project memory project =  Project(repoId, title, budget, 0, msg.sender);

    projects.push(project);

  }


  function fundProject(uint projectId) payable public {

    projects[projectId].availableFund = msg.value;


  }

  function getProjectsCount() public view returns (uint) {
    return projects.length;
  }

}
