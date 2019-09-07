var hello = artifacts.require("./Hello.sol");

module.exports = function(deployer) {
  deployer.deploy(hello);
};
