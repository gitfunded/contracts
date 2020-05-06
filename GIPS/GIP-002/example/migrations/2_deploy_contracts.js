const voting = artifacts.require("voting");

module.exports = function(deployer) {
  deployer.then(async () => {

    let VotingAddress;

    await deployer.deploy(voting).then(() => {

      VotingAddress = voting.address;
      console.log("Voting address: ", VotingAddress);
    });


  });
};
