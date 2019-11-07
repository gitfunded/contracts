pragma solidity ^0.5.0;

contract GitFundedGrant {


  enum ExpenseStatus {
    PENDING,
    PARTIALLY_ACCEPTED,
    ACCEPTED,
    REJECTED
  }


  // New project structure
  struct Project {
    string repoId;
    string title;
    uint budget; // In dollars
    uint availableFund; // In Ether
    address owner;

  }

  // New expense structure
  struct Expense {
    string title;
    uint amount; // In dollars
    uint allocated; // In Ether
    ExpenseStatus status;
  }

  event projectAdded (
    string repoId,
    string title,
    uint budget, // In dollars
    uint availableFund, // In Ether
    address owner

    );

  Project[] public projects;
  mapping(uint=>Expense[]) public expenses;
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

  function addExpense(uint projectId, string memory title, uint amount) public {

    Expense memory expense = Expense(title, amount, 0, ExpenseStatus.PENDING);
    expenses[projectId].push(expense);

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

  function getExpensesCount(uint projectId) public view returns (uint) {
    return expenses[projectId].length;
  }

}
