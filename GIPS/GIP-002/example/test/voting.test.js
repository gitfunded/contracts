const voting = artifacts.require('./votingFactory.sol');
const voting1 = artifacts.require('./voting.sol');

contract('Voting Tests', (accounts) => {
    let votingInstance1,votingInstance;

    const account_a = accounts[0];

    before(async () => {
        votingInstance1 = await voting.deployed();

    });

    beforeEach(async () => {
        await votingInstance1.newVoting();
        const voteAddress = await votingInstance1.getContractAddress.call({from: account_a});
        //daoInstance = await Moloch.at(daoAddress[0]);
        votingInstance=await voting1.at(voteAddress[0]);

    });

    describe('deployment', async () => {
        it('deploys successfully', async () => {

            // Checking for valid contract account address

            assert.equal(votingInstance.address.length, 42);

        });

    });

    describe('Voting', async () => {
        it('Vote Pass Functionality', async () => {

            await votingInstance.initialize(3,3,8);
            const voteId=await votingInstance.newVote(true,true);       
            await votingInstance.vote(await votingInstance.votesLength()-1,true,true);
            await votingInstance.vote(await votingInstance.votesLength()-1,true,true);
            await votingInstance.vote(await votingInstance.votesLength()-1,false,true);
            const res=await votingInstance.exec(await votingInstance.votesLength()-1);
            assert.equal(res,true);
        });

        it('Support Required working', async () => {

            await votingInstance.initialize(3,4,8);
            const voteId=await votingInstance.newVote(true,true);
            await votingInstance.vote(await votingInstance.votesLength()-1,true,true);
            await votingInstance.vote(await votingInstance.votesLength()-1,false,true);
            await votingInstance.vote(await votingInstance.votesLength()-1,false,true);
            const res=await votingInstance.exec(await votingInstance.votesLength()-1);
            assert.equal(res,false);
        });

        it('Min Quorum Working', async () => {

            await votingInstance.initialize(3,5,8);
            const voteId=await votingInstance.newVote(false,true);  
            await votingInstance.vote(await votingInstance.votesLength()-1,true,true);
            await votingInstance.vote(await votingInstance.votesLength()-1,true,true);
            await votingInstance.vote(await votingInstance.votesLength()-1,true,true);
            const res=await votingInstance.exec(await votingInstance.votesLength()-1);
            assert.equal(res,false);
        });

    });
});
