const GitFundedGrant = artifacts.require('./GitFundedGrant.sol');
const GitFundedGrantFactory = artifacts.require('./GitFundedGrantFactory.sol');
const StandardBounties = artifacts.require('./bounties/StandardBounties.sol');
const BountiesMetaTxRelayer = artifacts.require('./bounties/BountiesMetaTxRelayer.sol');
const keccak256 = require('js-sha3').keccak_256;
const ENSSubdomainRegistrar = artifacts.require('./ens/ENSSubdomainRegistrar.sol');
const DAOFactory = artifacts.require('./dao/DAOFactory.sol')

const Moloch = artifacts.require('./dao/Governance');
const GuildBank = artifacts.require('./dao/GuildBank');
const Token = artifacts.require('./dao/Token');
const Submitter = artifacts.require('./dao/Submitter');

const deploymentConfig = {
    'PERIOD_DURATION_IN_SECONDS': 5,
    'VOTING_DURATON_IN_PERIODS': 2,
    'GRACE_DURATON_IN_PERIODS': 35,
    'EMERGENCY_PROCESSING_WAIT_IN_PERIODS': 70,
    'BAILOUT_WAIT_IN_PERIODS': 75,
    'PROPOSAL_DEPOSIT': 10,
    'DILUTION_BOUND': 3,
    'PROCESSING_REWARD': 1,
    'TOKEN_SUPPLY': 10000
};

require('chai')
  .use(require('chai-as-promised'))
  .should();

async function blockTime () {
    const block = await web3.eth.getBlock('latest')
    return block.timestamp
}

async function snapshot () {
    return ethereum.send('evm_snapshot', [])
}

async function restore (snapshotId) {
    return ethereum.send('evm_revert', [snapshotId])
}

async function forceMine () {
    return ethereum.send('evm_mine', [])
}

async function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
   }



contract('DAOContract', (accounts) => {
    let moloch, guildBank, tokenAlpha, submitter;

    let contract, projectInstance, daoInstance, StandardBountiesContract, BountiesRelayerContract, DAOFactoryContract, first=false;

    const account_a = accounts[0];

    let proposal1, proposal2, depositToken, snapshotId;

    const initSummonerBalance = 100;

    const firstProposalIndex = 0;
    const secondProposalIndex = 1;
    const thirdProposalIndex = 2;
    const invalidPropsalIndex = 123;

    const yes = 1;
    const no = 2;

    const standardShareRequest = 100;
    const standardLootRequest = 73;
    const standardTribute = 80;
    const summonerShares = 1;

    const summoner = accounts[0];

  before(async () => {
      tokenAlpha = await Token.new(deploymentConfig.TOKEN_SUPPLY);

      moloch = await Moloch.new(
          summoner,
          [tokenAlpha.address],
          deploymentConfig.PERIOD_DURATION_IN_SECONDS,
          deploymentConfig.VOTING_DURATON_IN_PERIODS
      );

      contract = await GitFundedGrantFactory.deployed();
      StandardBountiesContract = await StandardBounties.deployed();
      BountiesRelayerContract = await BountiesMetaTxRelayer.deployed();
      DAOFactoryContract = await DAOFactory.deployed();

      const guildBankAddress = await moloch.guildBank();
      guildBank = await GuildBank.at(guildBankAddress);

      const proposalCount = await moloch.proposalCount();



  });

    beforeEach(async () => {

        proposal1 = {
            applicant: accounts[1],
            sharesRequested: standardShareRequest,
            //lootRequested: standardLootRequest,
            tributeOffered: standardTribute,
            tributeToken: tokenAlpha.address,
            paymentRequested: 0,
            paymentToken: tokenAlpha.address,
            details: 'all hail moloch'
        };

        proposal2 = {
            applicant: accounts[2],
            sharesRequested: 50,
            //lootRequested: 25,
            tributeOffered: 50,
            tributeToken: tokenAlpha.address,
            paymentRequested: 0,
            paymentToken: tokenAlpha.address,
            details: 'all hail moloch 2'
        };

        // tokenAlpha.transfer(summoner, initSummonerBalance, { from: accounts[1] });

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
        first=true;

        //Make current account as the admin
        await DAOFactoryContract.newDAO(account_a);
        const daoAddress = await DAOFactoryContract.getContractAddress.call({from: account_a});
        daoInstance = await Moloch.at(daoAddress[0]);

        await projectInstance.initialize(daoAddress[0]);


    });

  describe('Moloch contract',  () => {
    it('deploys successfully', async () => {

        console.log(await projectInstance.getExpensesCount());
        console.log(await daoInstance.proposalCount());



    });
    // it('deploys successfully Moloch', async () => {

    //     console.log(await projectInstance.getProposalQueueLength());
    //     //console.log(await projectInstance.proposalCount());
    // });
    it('Member Count', async () => {
        let bef = await daoInstance.getMembers();
        await daoInstance.addContributor({from: accounts[1]});
        await daoInstance.addContributor({from: accounts[2]});
        await daoInstance.addContributor({from: accounts[3]});
        let aft = await daoInstance.getMembers();
        assert.equal(parseInt(bef),1);
        assert.equal(parseInt(aft),4);
    });
    
    it('check submit proposal', async () => {
        let bef = await daoInstance.getProposal();
        await daoInstance.addContributor({from: accounts[1]});
        await daoInstance.addContributor({from: accounts[2]});
        await daoInstance.addContributor({from: accounts[3]});

        await daoInstance.submitProposal(10,40,tokenAlpha.address,20,tokenAlpha.address,"112",{from: accounts[1]});
        await daoInstance.submitProposal(15,20,tokenAlpha.address,25,tokenAlpha.address,"122",{from: accounts[2]});
        await daoInstance.submitProposal(15,20,tokenAlpha.address,25,tokenAlpha.address,"122",{from: accounts[3]});
        
        let aft = await daoInstance.getProposal();
        assert.equal(parseInt(bef),parseInt(aft)-3);
    });

    // it('check vote and process proposal', async () => {
    //     let bef=await daoInstance.getProposal();
    //     await daoInstance.addContributor({from: accounts[1]});
    //     await daoInstance.addContributor({from: accounts[2]});
    //     let id=await daoInstance.submitProposal(10,40,tokenAlpha.address,20,tokenAlpha.address,"112",{from: accounts[1]});
    //     let aft=await daoInstance.getProposal();
    //     //console.log(id);
    //     await daoInstance.submitVote(0,2,{from: accounts[0]});
    //     await sleep(13000);
    //     // sleep(13000).then(() => {
    //     //      daoInstance.processProposal(0);

    //     // });

    //     await daoInstance.processProposal(0);
    //     let res=await daoInstance.getResult();
    //     assert.equal(parseInt(res),2);
    //     assert.equal(parseInt(bef),parseInt(aft)-1);
    // });

    it('check vote', async () => {

        let bef=await daoInstance.getProposal();
        await daoInstance.addContributor({from: accounts[1]});
        await daoInstance.addContributor({from: accounts[2]});

        let id=await daoInstance.submitProposal(10,40,tokenAlpha.address,20,tokenAlpha.address,"112",{from: accounts[1]});
        let aft=await daoInstance.getProposal();

        await sleep(13000);

        await daoInstance.submitVote(0,1,{from: accounts[0]});
        //await daoInstance.submitVote(0,1,{from: accounts[1]});

        let vot=await daoInstance.getMemberProposalVote(accounts[0],0);
        let vot1=await daoInstance.getMemberProposalVote(accounts[1],0);

        assert.equal(parseInt(bef),parseInt(aft)-1);
    });

    it('check cancel proposal', async () => {
        let bef = await daoInstance.getProposal();
        await daoInstance.addContributor({from: accounts[1]});

        await daoInstance.submitProposal(10,40,tokenAlpha.address,20,tokenAlpha.address,"112",{from: accounts[1]});
        await daoInstance.submitProposal(15,20,tokenAlpha.address,25,tokenAlpha.address,"122",{from: accounts[2]});

        let aft = await daoInstance.getProposal();

        await daoInstance.cancelProposal(parseInt(aft-2),{from: accounts[1]});

        //await daoInstance.submitVote(parseInt(aft-2),1,{from: accounts[0]});
        await daoInstance.submitVote(parseInt(aft-1),1,{from: accounts[0]});

        assert.equal(parseInt(bef),parseInt(aft)-2);
    });



  });

});
