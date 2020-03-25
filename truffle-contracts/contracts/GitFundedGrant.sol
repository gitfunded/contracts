pragma solidity >=0.5.0 < 0.6.0;
import './SafeMath.sol';
import './bounties/BountiesMetaTxRelayer.sol';

contract GitFundedGrant {


    uint public version = 1;
    uint public minorVersion = 1;


  constructor(string memory i_repoId, string memory i_title, uint i_budget, address payable i_admin, address i_bountyAddress) public {

    repoId = i_repoId;
    title = i_title;
    budget = i_budget;
    admin = i_admin;
    availableFund = 0;
    live = true;

    bountiesContract = BountiesMetaTxRelayer(i_bountyAddress);
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
    uint bountyId;
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
  BountiesMetaTxRelayer public bountiesContract;

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


  function addExpense(string memory _title, uint _amount) public {

    Expense memory expense = Expense(_title, _amount, 0, msg.sender, ExpenseStatus.PENDING);
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


  // Bounties related methods are called for Issues


  //TODO: Modify the Issue struct to store more bounty details
    function addIssue(string memory _title, uint _amount) public {

        Issue memory issue = Issue(_title, _amount, 0, 0, msg.sender, IssueStatus.BACKLOG);
        issues.push(issue);

    }
  // A bounty will be created without funding
    function acceptIssueWithNoFund(uint issueIndex,
            bytes memory signature,
            address payable[] memory _issuers,
            address[] memory _approvers,
            string memory _data,
            uint _deadline,
            address _token,
            uint _tokenVersion,
            uint _nonce) onlyAdmin public {

        uint amount = issues[issueIndex].amount;
        require(issues[issueIndex].status == IssueStatus.BACKLOG);
        require(availableFund >= amount, "Funds not available");


        issues[issueIndex].status = IssueStatus.TODO;
        availableFund -= amount;
        issues[issueIndex].allocated =  amount;

        issues[issueIndex].bountyId=bountiesContract.metaIssueBounty(signature, _issuers,
            _approvers, _data, _deadline, _token, _tokenVersion, _nonce);

    }


 // A bounty will be created by funding it with the existing grant amount
  function acceptIssue(uint issueIndex,
    bytes memory signature,
    address payable[] memory _issuers,
    address[] memory _approvers,
    string memory _data,
    uint _deadline,
    address _token,
    uint _tokenVersion,
    uint _depositAmount,
    uint _nonce) onlyAdmin public payable {

    uint amount = issues[issueIndex].amount;
    require(issues[issueIndex].status == IssueStatus.BACKLOG);
    require(availableFund >= amount, "Funds not available");


    issues[issueIndex].status = IssueStatus.TODO;
    availableFund -= amount;
    issues[issueIndex].allocated =  amount;
    issues[issueIndex].bountyId=bountiesContract.metaIssueAndContribute.value(amount)(signature, _issuers,
      _approvers, _data, _deadline, _token, _tokenVersion, _depositAmount, _nonce);

  }

 function fundIssue(
    uint issueIndex,
    bytes memory _signature,
    uint _amount,
    uint _nonce) public{

      uint _bountyId=issues[issueIndex].bountyId;
      // require(issues[issueIndex].status == IssueStatus.TODO);
      issues[issueIndex].allocated +=  _amount;      
      bountiesContract.metaContribute.value(_amount)(_signature,_bountyId,_amount,_nonce);




   }

  





}
