const Caller = artifacts.require('./Caller.sol');


contract('CallerTests', (accounts) => {
    let callerInstance;

    const account_a = accounts[0];

    before(async () => {
        callerInstance = await Caller.deployed();

    });

    beforeEach(async () => {

    });

    describe('deployment', async () => {
        it('deploys successfully', async () => {

            // Checking for valid contract account address

            assert.equal(callerInstance.address.length, 42);

        });

    });

    describe('caller invoke', async () => {
        it('get value', async () => {

            let r_value = parseInt(await callerInstance.get());
            assert.equal(r_value, 0);

        });
        it('set value', async () => {

            await callerInstance.store();
            let r_value = parseInt(await callerInstance.get());
            assert.equal(r_value, 1);

        });
    });
});
