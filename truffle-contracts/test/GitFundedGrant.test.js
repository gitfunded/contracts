const GitFundedGrant = artifacts.require('./GitFundedGrant.sol');

require('chai')
  .use(require('chai-as-promised'))
  .should();

contract('GitFundedGrant', (accounts) => {
  let contract;
  console.log(accounts);

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
        it('creates successfully', async () => {

            await contract.addProject('001', 'testRepo1', 1000 );
            await contract.addProject('002', 'testRepo2', 2000 );
            let totalProject = await contract.getProjectsCount();
            assert.equal(totalProject, 2)

        });
        it('funded successfully', async () => {

            await contract.fundProject(0, {from: accounts[0], value: web3.utils.toWei("1", "ether")});
            let projectInfo = await contract.fetchProject(0);
            assert.equal(projectInfo[3], web3.utils.toWei("1", "ether"));

            await contract.fundProject(1, {from: accounts[0], value: web3.utils.toWei("2", "ether")});
            projectInfo = await contract.fetchProject(1);
            assert.equal(projectInfo[3], web3.utils.toWei("2", "ether"));

        });


    });



});
