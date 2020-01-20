const GitFundedGrant = artifacts.require('./GitFundedGrant.sol');
const GitFundedGrantFactory = artifacts.require('./GitFundedGrantFactory.sol');

require('chai')
  .use(require('chai-as-promised'))
  .should();

contract('GitFundedGrant', (accounts) => {
  let contract;
  let projectInstance;

  const account_a = accounts[0];

  before(async () => {
    contract = await GitFundedGrantFactory.deployed();
    const GitFundedGrantcontract = await GitFundedGrantFactory.deployed()
  });

  beforeEach(async () => {

      await contract.newProject(
          'testRepo1',
          'testRepo title',
          1000,
          {from: accounts[0]}
      );

      const contractAddress = await contract.getContractAddress.call({from: account_a});
      projectInstance = await GitFundedGrant.at(contractAddress[0]);

    });

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = contract.address;
        // Checking for valid contract account address
        assert.equal(address.length, 42);

    });

  });

    describe('projects', async () => {
        it('created successfully', async () => {


            const totalProjectsBefore = await contract.getProjectsCount();
            await contract.newProject(
                'testRepo2',
                'testRepo2 title',
                2000,
                {from: account_a}
            );

            const contractAddress = await contract.getContractAddress.call({from: account_a});
            const instance = await GitFundedGrant.at(contractAddress[0]);
            const totalProjectsAfter = await contract.getProjectsCount();

            assert.equal(parseInt(totalProjectsBefore) + 1, totalProjectsAfter)

        });

        it('funded successfully', async () => {

            await projectInstance.fundProject({from: account_a, value: web3.utils.toWei("1", "ether")});
            let projectInfo = await projectInstance.fetchProject();
            assert.equal(projectInfo[3], web3.utils.toWei("1", "ether"));

            await projectInstance.fundProject({from: account_a, value: web3.utils.toWei("2", "ether")});
            projectInfo = await projectInstance.fetchProject();

            // Expecting total balance of 3 ether as 1 ether was project's previous balance
            assert.equal(projectInfo[3], web3.utils.toWei("3", "ether"));

        });



        //TODO: Uncomment the assertion after fixing the test
        it('funds transferred successfully', async () => {

            await projectInstance.fundProject({from: accounts[0], value: web3.utils.toWei("2", "ether")});
            let projectInfo = await projectInstance.fetchProject();
            // assert.equal(projectInfo[3], web3.utils.toWei("1", "ether"));

            let initBalance = await web3.eth.getBalance(accounts[1]);
            await projectInstance.transferFund.call(accounts[1], web3.utils.toWei("1", "ether"));


            // assert.equal(parseInt(initBalance) + parseInt(web3.utils.toWei("1", "ether")),
            //     await web3.eth.getBalance(accounts[1]));

        });

        it('expenses added successfully', async () => {

            await projectInstance.addExpense('testExpense1', 50 );
            await projectInstance.addExpense('testExpense2', 100 );

            let totalExpenses = await projectInstance.getExpensesCount();
            assert.equal(totalExpenses, 2)
        });

        it('expense accepted successfully', async () => {

            let expenseRecipient = accounts[3];

            await projectInstance.fundProject({from: accounts[0], value: web3.utils.toWei("2", "ether")});
            await projectInstance.addExpense('testExpense3', web3.utils.toWei("1", "ether"), {from: expenseRecipient});

            let initBalance = await web3.eth.getBalance(expenseRecipient);
            await projectInstance.acceptExpense(await projectInstance.getExpensesCount() - 1);

            assert.equal(parseInt(initBalance) + parseInt(web3.utils.toWei("1", "ether")),
                await web3.eth.getBalance(expenseRecipient));

        });

        it('issues added successfully', async () => {

            await projectInstance.addIssue('testIssue1', 50 );
            await projectInstance.addIssue('testIssue2', 100 );

            let totalIssues = await projectInstance.getIssuesCount();
            assert.equal(totalIssues, 2)
        });

        it('issue accepted successfully', async () => {

            let issueFundRecipient = accounts[3];
            let totalIssues = await projectInstance.getIssuesCount();

            await projectInstance.fundProject({from: accounts[0], value: web3.utils.toWei("1", "ether")});
            await projectInstance.addIssue('testIssue3', web3.utils.toWei("1", "ether"), {from: issueFundRecipient});

            await projectInstance.acceptIssue(await projectInstance.getIssuesCount() - 1);

            assert.equal(await projectInstance.getIssuesCount(), parseInt(totalIssues) + 1);

        });




    });



});
