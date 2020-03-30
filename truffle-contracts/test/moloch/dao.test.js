const GitFundedGrant = artifacts.require('./GitFundedGrant.sol');
const GitFundedGrantFactory = artifacts.require('./GitFundedGrantFactory.sol');
const StandardBounties = artifacts.require('./bounties/StandardBounties.sol');
const BountiesMetaTxRelayer = artifacts.require('./bounties/BountiesMetaTxRelayer.sol');

const Moloch = artifacts.require('./dao/Moloch');
const GuildBank = artifacts.require('./dao/GuildBank');
const Token = artifacts.require('./dao/Token');
const Submitter = artifacts.require('./dao/Submitter');

const deploymentConfig = {
    'PERIOD_DURATION_IN_SECONDS': 17280,
    'VOTING_DURATON_IN_PERIODS': 35,
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



contract('DAOContract', (accounts) => {
    let moloch, guildBank, tokenAlpha, submitter;

    let contract, projectInstance, StandardBountiesContract, BountiesRelayerContract;

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

      // moloch = await Moloch.new(
      //     summoner,
      //     [tokenAlpha.address],
      //     deploymentConfig.PERIOD_DURATION_IN_SECONDS,
      //     deploymentConfig.VOTING_DURATON_IN_PERIODS,
      //     deploymentConfig.GRACE_DURATON_IN_PERIODS,
      //     deploymentConfig.EMERGENCY_PROCESSING_WAIT_IN_PERIODS,
      //     deploymentConfig.BAILOUT_WAIT_IN_PERIODS,
      //     deploymentConfig.PROPOSAL_DEPOSIT,
      //     deploymentConfig.DILUTION_BOUND,
      //     deploymentConfig.PROCESSING_REWARD,
      // );

      contract = await GitFundedGrantFactory.deployed();
      StandardBountiesContract = await StandardBounties.deployed();
      BountiesRelayerContract = await BountiesMetaTxRelayer.deployed();

      // const guildBankAddress = await moloch.guildBank();
      // guildBank = await GuildBank.at(guildBankAddress);
      //
      // const proposalCount = await moloch.proposalCount();
      // console.log(proposalCount);



  });

    beforeEach(async () => {

        proposal1 = {
            applicant: accounts[1],
            sharesRequested: standardShareRequest,
            lootRequested: standardLootRequest,
            tributeOffered: standardTribute,
            tributeToken: tokenAlpha.address,
            paymentRequested: 0,
            paymentToken: tokenAlpha.address,
            details: 'all hail moloch'
        };

        proposal2 = {
            applicant: accounts[2],
            sharesRequested: 50,
            lootRequested: 25,
            tributeOffered: 50,
            tributeToken: tokenAlpha.address,
            paymentRequested: 0,
            paymentToken: tokenAlpha.address,
            details: 'all hail moloch 2'
        };

        // tokenAlpha.transfer(summoner, initSummonerBalance, { from: accounts[1] });

        await contract.newProject(
            'testRepo1',
            'testRepo title',
            1000,
            {from: accounts[0]}
        );

        const contractAddress = await contract.getContractAddress.call({from: account_a});
        projectInstance = await GitFundedGrant.at(contractAddress[0]);
    });

  describe('constructor',  () => {
    it('deploys successfully', async () => {

        console.log(await projectInstance.getExpensesCount());
        console.log(await projectInstance.proposalCount());



    });

  });

});
