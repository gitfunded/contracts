var gitFundedGrant = artifacts.require("./GitFundedGrant.sol");

module.exports = function(deployer) {
  deployer.deploy(gitFundedGrant);
};
