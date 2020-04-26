const Callee = artifacts.require("Callee");
const Caller   = artifacts.require("Caller");

module.exports = function(deployer) {
  deployer.then(async () => {

    let CalleeAddress;

    await deployer.deploy(Callee).then(() => {

      CalleeAddress = Callee.address;
      console.log("Contract address: ", CalleeAddress);
    });

    await deployer.deploy(Caller, CalleeAddress).then(() => {

    });


  });
};
