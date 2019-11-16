const GitFundedGrant = artifacts.require('./GitFundedGrant.sol');

require('chai')
  .use(require('chai-as-promised'))
  .should();

contract('GitFundedGrant', (accounts) => {
  let contract;

  before(async () => {
    contract = await GitFundedGrant.deployed()
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

            await contract.addProject('001', 'testRepo1', 1000 );
            await contract.addProject('002', 'testRepo2', 2000 );
            await contract.addProject('003', 'testRepo3', 3000 );
            let totalProject = await contract.getProjectsCount();
            assert.equal(totalProject, 3)

        });

        it('funded successfully', async () => {

            await contract.fundProject(0, {from: accounts[0], value: web3.utils.toWei("1", "ether")});
            let projectInfo = await contract.fetchProject(0);
            assert.equal(projectInfo[3], web3.utils.toWei("1", "ether"));

            await contract.fundProject(1, {from: accounts[0], value: web3.utils.toWei("2", "ether")});
            projectInfo = await contract.fetchProject(1);
            assert.equal(projectInfo[3], web3.utils.toWei("2", "ether"));

        });

        it('funds transferred successfully', async () => {

            await contract.fundProject(2, {from: accounts[0], value: web3.utils.toWei("1", "ether")});
            let projectInfo = await contract.fetchProject(0);
            assert.equal(projectInfo[3], web3.utils.toWei("1", "ether"));


            let initBalance = await web3.eth.getBalance(accounts[1]);
            await contract.transferFund(2, accounts[1], web3.utils.toWei("1", "ether"));

            assert.equal(parseInt(initBalance) + parseInt(web3.utils.toWei("1", "ether")),
                await web3.eth.getBalance(accounts[1]));

        });

        it('expenses added successfully', async () => {

            await contract.addExpense(0, 'testExpense1', 50 );
            await contract.addExpense(0, 'testExpense2', 100 );

            let totalExpenses = await contract.getExpensesCount(0);
            assert.equal(totalExpenses, 2)
        });

        it('expense accepted successfully', async () => {

            let expenseRecipient = accounts[3];

            await contract.fundProject(2, {from: accounts[0], value: web3.utils.toWei("1", "ether")});
            await contract.addExpense(2, 'testExpense3', web3.utils.toWei("1", "ether"), {from: expenseRecipient});

            let initBalance = await web3.eth.getBalance(expenseRecipient);
            await contract.acceptExpense(2, 0);

            assert.equal(parseInt(initBalance) + parseInt(web3.utils.toWei("1", "ether")),
                await web3.eth.getBalance(expenseRecipient));

        });

        it('issues added successfully', async () => {

            await contract.addIssue(0, 'testIssue1', 50 );
            await contract.addIssue(0, 'testIssue2', 100 );

            let totalExpenses = await contract.getIssuesCount(0);
            assert.equal(totalExpenses, 2)
        });

        it('issue accepted successfully', async () => {

            let issueFundRecipient = accounts[3];

            await contract.fundProject(2, {from: accounts[0], value: web3.utils.toWei("1", "ether")});
            await contract.addIssue(2, 'testIssue3', web3.utils.toWei("1", "ether"), {from: issueFundRecipient});

            await contract.acceptIssue(2, 0);

            assert.equal(await contract.getIssuesCount(2), 1);

        });




    });



});
