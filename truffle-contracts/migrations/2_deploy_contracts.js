const gitFundedGrantFactory = artifacts.require("./GitFundedGrantFactory.sol");
const bountyContract = artifacts.require("./bounties/StandardBounties.sol");
const bountyRelayerContract = artifacts.require("./bounties/BountiesMetaTxRelayer.sol");

module.exports = function(deployer) {

    let bountyContractAddress,  bountyRelayerContractAddress;
    let bountyContractInstance;

    deployer.then(async () => {

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

        await deployer.deploy(gitFundedGrantFactory, bountyRelayerContractAddress).then(() => {

            console.log("gitFundedGrantFactory address: ", gitFundedGrantFactory.address)
        });
    });
};
