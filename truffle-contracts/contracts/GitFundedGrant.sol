pragma solidity >=0.5.0 < 0.6.0;
import './SafeMath.sol';

contract GitFundedGrant {


  constructor(string memory i_repoId, string memory i_title, uint i_budget, address payable i_admin) public {

    repoId = i_repoId;
    title = i_title;
    budget = i_budget;
    admin = i_admin;
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


  Expense[] public expenses;
  Issue[] public issues;

  address payable public admin;
  string public repoId;
  string public title;
  uint budget; // In dollars
  uint availableFund; // In Ether
  bool live;

  modifier onlyAdmin  {
      require(msg.sender == admin, "Not Authorised");
      _;
  }


  function destroy() public onlyAdmin {
        selfdestruct(admin);
    }

  function fetchProject() view public returns (string memory, string memory, uint, uint, address) {

    return (repoId, title, budget, availableFund, admin);
  }


  function addExpense(string memory title, uint amount) public {

    Expense memory expense = Expense(title, amount, 0, msg.sender, ExpenseStatus.PENDING);
    expenses.push(expense);

  }

  function acceptExpense(uint expenseIndex) onlyAdmin public {

    uint amount = expenses[expenseIndex].amount;
    require(expenses[expenseIndex].status == ExpenseStatus.PENDING);
    require(availableFund >= amount, "Funds not available");


    expenses[expenseIndex].status = ExpenseStatus.ACCEPTED;
    availableFund -= amount;
    expenses[expenseIndex].allocated =  amount;
    expenses[expenseIndex].recipient.transfer(amount);

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

  function addIssue(string memory title, uint amount) public {

    Issue memory issue = Issue(title, amount, 0, msg.sender, IssueStatus.BACKLOG);
    issues.push(issue);

  }

  function acceptIssue(uint issueIndex) onlyAdmin public {

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

}
