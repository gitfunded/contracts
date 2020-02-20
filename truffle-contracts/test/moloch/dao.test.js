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



contract('GitFundedGrant', (accounts) => {
    let moloch, guildBank, tokenAlpha, submitter;

  const summoner = accounts[0];

  before(async () => {
      tokenAlpha = await Token.new(deploymentConfig.TOKEN_SUPPLY);

      moloch = await Moloch.new(
          summoner,
          [tokenAlpha.address],
          deploymentConfig.PERIOD_DURATION_IN_SECONDS,
          deploymentConfig.VOTING_DURATON_IN_PERIODS,
          deploymentConfig.GRACE_DURATON_IN_PERIODS,
          deploymentConfig.EMERGENCY_PROCESSING_WAIT_IN_PERIODS,
          deploymentConfig.BAILOUT_WAIT_IN_PERIODS,
          deploymentConfig.PROPOSAL_DEPOSIT,
          deploymentConfig.DILUTION_BOUND,
          deploymentConfig.PROCESSING_REWARD,
      );

      const guildBankAddress = await moloch.guildBank();
      guildBank = await GuildBank.at(guildBankAddress);
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

      console.log(await guildBank.owner());

  });

  beforeEach(async () => {


    });

  describe('deployment', async () => {
    it('deploys successfully', async () => {


    });

  });

});
