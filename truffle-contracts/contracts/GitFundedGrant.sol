pragma solidity >=0.5.0 < 0.6.0;
import './SafeMath.sol';

contract GitFundedGrant {


  constructor(string memory repoId, string memory title, uint budget) public {

    owner = msg.sender;
    repoId = repoId;
    title = title;
    budget = budget;
    availableFund = 0;
    live = true;
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

  Expense[] public expenses;
  Issue[] public issues;

  address payable public owner;
  string public repoId;
  string public title;
  uint budget; // In dollars
  uint availableFund; // In Ether
  bool live;

  modifier onlyOwner  {
      require(msg.sender == owner, "Not Authorised");
      _;
  }


  function destroy() public onlyOwner {
        selfdestruct(owner);
    }

//  function fetchProject(uint projectId) view public returns (string memory, string memory, uint, uint, address) {
//
//    Project memory project = projects[projectId];
//
//    return (project.repoId, project.title, project.budget, project.availableFund, project.owner);
//  }


  function addExpense(string memory title, uint amount) public {

    Expense memory expense = Expense(title, amount, 0, msg.sender, ExpenseStatus.PENDING);
    expenses.push(expense);

  }

  function acceptExpense(uint expenseIndex) onlyOwner public {

    uint amount = expenses[expenseIndex].amount;
    require(expenses[expenseIndex].status == ExpenseStatus.PENDING);
    require(availableFund >= amount, "Funds not available");


    expenses[expenseIndex].status = ExpenseStatus.ACCEPTED;
    availableFund -= amount;
    expenses[expenseIndex].allocated =  amount;
    expenses[expenseIndex].recipient.transfer(amount);

  }

  // TODO: Merge this logic with the acceptExpense by overloading the function
  function acceptPartialExpense(uint expenseIndex, uint amount) onlyOwner public {

    require(expenses[expenseIndex].status == ExpenseStatus.PENDING);
    require(availableFund >= amount, "Funds not available");


    expenses[expenseIndex].status = ExpenseStatus.PARTIALLY_ACCEPTED;
    availableFund -= amount;
    expenses[expenseIndex].allocated =  amount;
    expenses[expenseIndex].recipient.transfer(amount);


  }

  function addIssue(string memory title, uint amount) public {

    Issue memory issue = Issue(title, amount, 0, msg.sender, IssueStatus.BACKLOG);
    issues.push(issue);

  }

  function acceptIssue(uint issueIndex) onlyOwner public {

    uint amount = issues[issueIndex].amount;
    require(issues[issueIndex].status == IssueStatus.BACKLOG);
    require(availableFund >= amount, "Funds not available");


    issues[issueIndex].status = IssueStatus.TODO;
    availableFund -= amount;
    issues[issueIndex].allocated =  amount;

  }


  function fundProject() payable public {

    availableFund = availableFund.add(msg.value);


  }

  function transferFund(address payable recipient, uint value) onlyOwner payable public {

    availableFund = availableFund.sub(value);
    recipient.transfer(value);


  }


  function getExpensesCount() public view returns (uint) {
    return expenses.length;
  }

  function getIssuesCount() public view returns (uint) {
    return issues.length;
  }

}
