const gitFundedGrantFactory = artifacts.require("./GitFundedGrantFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(gitFundedGrantFactory);
};
