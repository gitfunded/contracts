const gitFundedGrantFactory = artifacts.require("./GitFundedGrantFactory.sol");
const bountyContract = artifacts.require("./bounties/StandardBounties.sol");
const bountyRelayerContract = artifacts.require("./bounties/BountiesMetaTxRelayer.sol");
const tokenContract = artifacts.require("./dao/Token.sol");
const ENSProxy = artifacts.require("ENSProxy");
const keccak256 = require('js-sha3').keccak_256;



module.exports = function(deployer) {

    let bountyContractAddress,  bountyRelayerContractAddress, tokenAddress,enssubdomainRegistrarAddress;
    let bountyContractInstance;

    var tld = 'eth';
    let subDomain = 'gitfunded';
    var rootNode = '0x' + keccak256(subDomain);

    deployer.then(async () => {

        await deployer.deploy(tokenContract, 10000).then(() => {

            console.log("tokenContract address: ", tokenContract.address);
            tokenAddress = tokenContract.address;
        });

        await deployer.deploy(bountyContract).then((instance) => {
            console.log("bountyContract address: ", bountyContract.address);
            bountyContractAddress = bountyContract.address;
            bountyContractInstance = instance;
        });

        await deployer.deploy(bountyRelayerContract, bountyContractAddress).then(() => {
            console.log("bountyRelayerContract address: ", bountyRelayerContract.address);
            bountyRelayerContractAddress = bountyRelayerContract.address;

            // Set the metaTxRelayer of StandardBounties to authenticate the relayer contract
            bountyContractInstance.setMetaTxRelayer(bountyRelayerContractAddress);
        });

        // await deployer.deploy(enssubdomainregistrar, ).then(() => {

        //     console.log("ENSSubdomainRegistrar address: ", enssubdomainregistrar.address);
        //     enssubdomainregistrarAddress = enssubdomainregistrar.address;
        // });
        await deployer.deploy(ENSProxy).then(async (ens) => {

            console.log("ENS Registry address: ", ens.address);
            await ens.deploySubdomainRegistrar(rootNode).then((tx)=>{console.log("Sub domain Registry deployed")});
            enssubdomainregistrarAddress=await ens.sdRegistrar();
            console.log("ENSSubdomainRegistrar Address ",enssubdomainregistrarAddress);

        });

        await deployer.deploy(gitFundedGrantFactory, bountyRelayerContractAddress, tokenAddress,enssubdomainregistrarAddress).then(() => {

            console.log("gitFundedGrantFactory address: ", gitFundedGrantFactory.address)
        });




    });
};
