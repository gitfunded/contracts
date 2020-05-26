const ENSProxy = artifacts.require('./ENSProxy.sol');
const ENSSd = artifacts.require("ENSSubdomainRegistrar");
const keccak256 = require('js-sha3').keccak_256;
const namehash = require('eth-ens-namehash').hash;


contract('ENSProxy', (accounts) => {
    let ensProxyInstance, sdRegistrarInstance;

    const account_a = accounts[0];

    before(async () => {
        ensProxyInstance = await ENSProxy.deployed();
        sdRegistrarInstance = await ENSSd.at(await ensProxyInstance.sdRegistrar());

    });

    beforeEach(async () => {

    });

    describe('deployment', async () => {
        it('deploys successfully', async () => {

            // Checking for valid contract account address

            assert.equal(ensProxyInstance.address.length, 42);
            assert.equal(sdRegistrarInstance.address.length, 42);

        });

    });

    describe('subdomain registrar', async () => {
        it('create name', async () => {

         // Add tests here
         //const labelNode=namehash('consenso.eth');
         const label='0x'+keccak256('consenso');
         await sdRegistrarInstance.createName(label,accounts[2]);
         assert.equal(await sdRegistrarInstance.getOwner(namehash('consenso.gitfunded.eth')),accounts[2]);
        });

        it('delete name', async () => {

         const label='0x'+keccak256('syndlend');
         const empty=0x0000000000000000000000000000000000000000;
         await sdRegistrarInstance.createName(label,accounts[2]);
         assert.equal(await sdRegistrarInstance.getOwner(namehash('syndlend.gitfunded.eth')),accounts[2]);

         //Deletion
         await sdRegistrarInstance.deleteName(label);
         //No owner associated with above created label
         assert.equal(await sdRegistrarInstance.getOwner(namehash('syndlend.gitfunded.eth')),empty);
        });

        it('set rootNode', async () => {

         const label='0x'+keccak256('syndlend');
         await sdRegistrarInstance.createName(label,sdRegistrarInstance.address);
         assert.equal(await sdRegistrarInstance.getOwner(namehash('syndlend.gitfunded.eth')),sdRegistrarInstance.address);

         await sdRegistrarInstance.setRootNode(namehash('syndlend.gitfunded.eth'));

         const labelNew='0x'+keccak256('check');
         await sdRegistrarInstance.createName(labelNew,accounts[2]);
         assert.equal(await sdRegistrarInstance.getOwner(namehash('check.syndlend.gitfunded.eth')),accounts[2]);
        });

        // it('createNameAndPoint Test', async () => {

        //  const label='0x'+keccak256('consenso1');
        //  await sdRegistrarInstance.createNameAndPoint(label,accounts[2]);
        //  assert.equal(await sdRegistrarInstance.getOwner(namehash('consenso1.gitfunded.eth')),sdRegistrarInstance.address);

        //  //Check Resolver
        //  const addr=await sdRegistrarInstance.getAddr(label);
        //  assert.equal(addr,accounts[2]);

        // });

        // it('PointRootNode Test', async () => {

        //     await sdRegistrarInstance.pointRootNode(accounts[4]);
        //     const addr=await sdRegistrarInstance.getAddr('gitfunded.eth');
        //     assert.equal(addr,accounts[4]);


        // });

    });
});
