const gitFundedGrantFactory = artifacts.require("./GitFundedGrantFactory.sol");
const bountyContract = artifacts.require("./bounties/StandardBounties.sol");
const bountyRelayerContract = artifacts.require("./bounties/BountiesMetaTxRelayer.sol");
const daoFactoryContract = artifacts.require("./dao/DAOFactory.sol");
const tokenContract = artifacts.require("./dao/Token.sol");

module.exports = function(deployer) {

    let bountyContractAddress,  bountyRelayerContractAddress, tokenAddress;
    let bountyContractInstance;

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

        await deployer.deploy(daoFactoryContract, tokenAddress).then(() => {

            console.log("daoFactoryContract address: ", daoFactoryContract.address)
        });

        await deployer.deploy(gitFundedGrantFactory, bountyRelayerContractAddress, tokenAddress).then(() => {

            console.log("gitFundedGrantFactory address: ", gitFundedGrantFactory.address)
        });


    });
};
