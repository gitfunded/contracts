pragma solidity ^0.5.0;

contract GitFundedGrant {


  // New project structure
  struct Project {
    string repoId;
    string title;
    address owner;
  }


  Project[] public projects;

  function fetchProject(uint projectId) view public returns (string memory, string memory, address) {

    Project memory project = projects[projectId];

    return (project.repoId, project.title, project.owner);
  }

  function addProject(string memory repoId, string memory title) public {

    Project memory project =  Project(repoId, title, msg.sender);

    projects.push(project);

  }


  function getProjectsCount() public view returns (uint) {
    return projects.length;
  }

}
