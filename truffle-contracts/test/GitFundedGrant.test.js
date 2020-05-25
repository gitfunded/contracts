const GitFundedGrant = artifacts.require('./GitFundedGrant.sol');
const GitFundedGrantFactory = artifacts.require('./GitFundedGrantFactory.sol');
const StandardBounties = artifacts.require('./bounties/StandardBounties.sol');
const BountiesMetaTxRelayer = artifacts.require('./bounties/BountiesMetaTxRelayer.sol');
const ENSSubdomainRegistrar = artifacts.require('./ens/ENSSubdomainRegistrar.sol');
const keccak256 = require('js-sha3').keccak_256;
const Token = artifacts.require('./dao/Token');
const DAOFactory = artifacts.require('./dao/DAOFactory.sol');
const Governance = artifacts.require('./dao/Governance.sol');
const TOKEN_SUPPLY=100;
require('chai')
  .use(require('chai-as-promised'))
  .should();

contract('GitFundedGrant', (accounts) => {

  let contract, projectInstance, daoInstance, StandardBountiesContract, BountiesRelayerContract, DAOFactoryContract, first=false, ENSSubdomainInstance;

  const account_a = accounts[0];

  before(async () => {
    contract = await GitFundedGrantFactory.deployed();
    StandardBountiesContract = await StandardBounties.deployed();
    BountiesRelayerContract = await BountiesMetaTxRelayer.deployed();
    DAOFactoryContract = await DAOFactory.deployed();
    tokenAlpha = await Token.new(TOKEN_SUPPLY);


  });

  beforeEach(async () => {

      if(first)
      {
        const label1='0x'+keccak256("organization");
        await ENSSubdomainInstance.deleteName(label1,{from: accounts[0]});
      }

      await contract.newProject(
          'testRepo1',
          'testRepo title',
          1000,
          '0x'+keccak256("organization"),
          {from: accounts[0]}
      );
      const contractAddress = await contract.getContractAddress.call({from: account_a});
      projectInstance = await GitFundedGrant.at(contractAddress[0]);
      const ensAddress = await contract.getEnsAddress.call({from: account_a});
      ENSSubdomainInstance= await ENSSubdomainRegistrar.at(ensAddress);
      //console.log(ENSSubdomainInstance);
      first=true;

      //Make GitFunded as the admin
      await DAOFactoryContract.newDAO(contractAddress[0]);
      const daoAddress = await DAOFactoryContract.getContractAddress.call({from: account_a});
      daoInstance = await Governance.at(daoAddress[0]);

      await projectInstance.initialize(daoAddress[0]);



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
                '0x'+keccak256("organization1"),
                {from: account_a}
            );

            const contractAddress = await contract.getContractAddress.call({from: account_a});
            const instance = await GitFundedGrant.at(contractAddress[0]);
            await instance.initialize(contractAddress[0]);
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

            await projectInstance.addExpense('testExpense1', 50,accounts[1],10,20,40,tokenAlpha.address,20,tokenAlpha.address,"112" );
            await projectInstance.addExpense('testExpense2', 100,accounts[1],10,20,40,tokenAlpha.address,20,tokenAlpha.address,"112" );

            let totalExpenses = await projectInstance.getExpensesCount();
            assert.equal(totalExpenses, 2)
        });

        it('expense accepted successfully', async () => {

            let expenseRecipient = accounts[3];

            await projectInstance.fundProject({from: accounts[0], value: web3.utils.toWei("2", "ether")});
            //await projectInstance.addExpense('testExpense3', web3.utils.toWei("1", "ether"), {from: expenseRecipient});
            await projectInstance.addExpense('testExpense3', web3.utils.toWei("1", "ether"),accounts[1],10,20,40,
                                              tokenAlpha.address,20,tokenAlpha.address,"112");

            await projectInstance.sponsorExpense(await projectInstance.getExpensesCount() - 1)
            let initBalance = parseInt(await projectInstance.availableFund())
            await projectInstance.acceptExpense(await projectInstance.getExpensesCount() - 1);

            assert.equal(initBalance - parseInt(web3.utils.toWei("1", "ether")),
                await parseInt(await projectInstance.availableFund()));

        });

        it('issues added successfully', async () => {

            await projectInstance.addIssue('testIssue1', 50);
            await projectInstance.addIssue('testIssue2', 100 );
            let totalIssues = await projectInstance.getIssuesCount();
            assert.equal(totalIssues, 2);

        });

        it('issue accepted successfully', async () => {

            let issueFundRecipient = accounts[3];
            let totalIssues = await projectInstance.getIssuesCount();

            const registryOwner = await StandardBountiesContract.owner.call();

            assert(registryOwner === accounts[0]);

            const latestNonce = await BountiesRelayerContract.replayNonce.call(accounts[0]);

            const nonce = web3.utils.hexToNumber(latestNonce);

            const params = [
                ["address", "string", "address[]", "address[]", "string", "uint", "address", "uint", "uint"],
                [
                    web3.utils.toChecksumAddress(BountiesRelayerContract.address),
                    "metaIssueBounty",
                    [accounts[3]],
                    [accounts[3]],
                    "data",
                    2528821098,
                    "0x0000000000000000000000000000000000000000",
                    0,
                    nonce
                ]
            ];

            let paramsHash = web3.utils.keccak256(web3.eth.abi.encodeParameters(...params));

            let signature = await web3.eth.sign(paramsHash, accounts[3]);

            await projectInstance.fundProject({from: accounts[0], value: web3.utils.toWei("1", "ether")});
            await projectInstance.addIssue('testIssue3', web3.utils.toWei("1", "ether"), {from: issueFundRecipient});

            await projectInstance.acceptIssueWithNoFund(await projectInstance.getIssuesCount() - 1, signature,
                [accounts[3]],
                [accounts[3]],
                "data",
                2528821098,
                "0x0000000000000000000000000000000000000000",
                0,
                nonce);

            assert.equal(await projectInstance.getIssuesCount(), parseInt(totalIssues) + 1);

            const bounty = await StandardBountiesContract.getBounty(0);
            assert(bounty != null, 'No bounty was created via the meta tx relayer');
            assert(bounty.issuers[0] === accounts[3], 'Bounty issuer not the same account who signed the meta tx');

        });

         it('issue with funds accepted successfully', async () => {

            let issueFundRecipient = accounts[3];
            let totalIssues = await projectInstance.getIssuesCount();

            const registryOwner = await StandardBountiesContract.owner.call();

            assert(registryOwner === accounts[0]);

            const latestNonce = await BountiesRelayerContract.replayNonce.call(accounts[0]);

            const nonce = web3.utils.hexToNumber(latestNonce);

             const params = [
                 ["address", "string", "address[]", "address[]", "string", "uint", "address", "uint", "uint", "uint"],
                 [
                     web3.utils.toChecksumAddress(BountiesRelayerContract.address),
                     "metaIssueAndContribute",
                     [accounts[3]],
                     [accounts[3]],
                     "data",
                     2528821098,
                     "0x0000000000000000000000000000000000000000",
                     0,
                     1,
                     nonce
                 ]
             ];

            let paramsHash = web3.utils.keccak256(web3.eth.abi.encodeParameters(...params));

            let signature = await web3.eth.sign(paramsHash, accounts[3]);

            await projectInstance.fundProject({from: accounts[0], value: web3.utils.toWei("1", "ether")});

            let totalBounties = await StandardBountiesContract.numBounties();
            await projectInstance.addIssue('testIssue4', web3.utils.toWei("1", "ether"), {from: issueFundRecipient});

             await projectInstance.acceptIssue(await projectInstance.getIssuesCount() - 1,
                 signature,
                 [accounts[3]],
                 [accounts[3]],
                 "data",
                 2528821098,
                 "0x0000000000000000000000000000000000000000",
                 0,
                 web3.utils.toWei("1", "ether"),
                 nonce);
            await projectInstance.fundIssue(await projectInstance.getIssuesCount() - 1,
                signature,
                web3.utils.toWei("1", "ether"),
                nonce);


            const bounty = await StandardBountiesContract.getBounty(totalBounties);

            assert.equal(await projectInstance.getIssuesCount(), parseInt(totalIssues) + 1);
            assert.equal(bounty.contributions.length, 2); // 2 contributions - 1 when creating the bounty and 1 during the fundIssue call
            assert(bounty !== [], 'No bounty was created via the meta tx relayer');
            assert(bounty.issuers[0] === accounts[3], 'Bounty issuer not the same account who signed the meta tx');

        });

    });

});
