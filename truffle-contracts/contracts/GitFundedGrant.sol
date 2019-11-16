pragma solidity >=0.5.0 < 0.6.0;

contract GitFundedGrant {


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


  // New project structure
  struct Project {
    string repoId;
    string title;
    uint budget; // In dollars
    uint availableFund; // In Ether
    address owner;

  }

  // New expense structure
  //  TODO: The expense amount should be maintained in dollar
  struct Expense {
    string title;
    uint amount; // In Ether
    uint allocated; // In Ether
    address payable recipient;
    ExpenseStatus status;
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

  event projectAdded (
    string repoId,
    string title,
    uint budget, // In dollars
    uint availableFund, // In Ether
    address owner

    );

  Project[] public projects;
  mapping(uint=>Expense[]) public expenses;
  mapping(uint=>Issue[]) public issues;
  address payable internal owner;

  constructor() public {
    owner = msg.sender;
  }

  modifier onlyOwner  {
      require(msg.sender == owner);
      _;
  }

  modifier onlyProjectOwner(uint projectId)  {
        require(msg.sender == projects[projectId].owner, "Not Authorised");
      _;
    }

  function destroy() public onlyOwner {
        selfdestruct(owner);
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

    Expense memory expense = Expense(title, amount, 0, msg.sender, ExpenseStatus.PENDING);
    expenses[projectId].push(expense);

  }

  function acceptExpense(uint projectId, uint expenseIndex) onlyProjectOwner(projectId) public {

    uint amount = expenses[projectId][expenseIndex].amount;
    require(expenses[projectId][expenseIndex].status == ExpenseStatus.PENDING);
    require(projects[projectId].availableFund>=amount, "Funds not available");


    expenses[projectId][expenseIndex].status = ExpenseStatus.ACCEPTED;
    projects[projectId].availableFund -= amount;
    expenses[projectId][expenseIndex].allocated =  amount;
    expenses[projectId][expenseIndex].recipient.transfer(amount);

  }

  // TODO: Merge this logic with the acceptExpense by overloading the function
  function acceptPartialExpense(uint projectId, uint expenseIndex, uint amount) onlyProjectOwner(projectId) public {

    require(expenses[projectId][expenseIndex].status == ExpenseStatus.PENDING);
    require(projects[projectId].availableFund>=amount, "Funds not available");


    expenses[projectId][expenseIndex].status = ExpenseStatus.PARTIALLY_ACCEPTED;
    projects[projectId].availableFund -= amount;
    expenses[projectId][expenseIndex].allocated =  amount;
    expenses[projectId][expenseIndex].recipient.transfer(amount);


  }

  function addIssue(uint projectId, string memory title, uint amount) public {

    Issue memory issue = Issue(title, amount, 0, msg.sender, IssueStatus.BACKLOG);
    issues[projectId].push(issue);

  }

  function acceptIssue(uint projectId, uint issueIndex) onlyProjectOwner(projectId) public {

    uint amount = issues[projectId][issueIndex].amount;
    require(issues[projectId][issueIndex].status == IssueStatus.BACKLOG);
    require(projects[projectId].availableFund>=amount, "Funds not available");


    issues[projectId][issueIndex].status = IssueStatus.TODO;
    projects[projectId].availableFund -= amount;
    issues[projectId][issueIndex].allocated =  amount;

  }


  function fundProject(uint projectId) payable public {

    projects[projectId].availableFund += msg.value;


  }

  function transferFund(uint projectId, address payable recipient, uint value) onlyProjectOwner(projectId) payable public {

    projects[projectId].availableFund -= value;
    recipient.transfer(value);


  }

  function getProjectsCount() public view returns (uint) {
    return projects.length;
  }

  function getExpensesCount(uint projectId) public view returns (uint) {
    return expenses[projectId].length;
  }

  function getIssuesCount(uint projectId) public view returns (uint) {
    return issues[projectId].length;
  }

}
