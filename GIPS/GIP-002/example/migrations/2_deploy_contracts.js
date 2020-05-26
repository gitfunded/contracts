const voting = artifacts.require("voting");
const votingFactory = artifacts.require("votingFactory");

module.exports = function(deployer) {
  deployer.then(async () => {

    let VotingAddress;

    await deployer.deploy(voting).then(() => {

      VotingAddress = voting.address;
      console.log("Voting address: ", VotingAddress);
    });


    await deployer.deploy(votingFactory).then(() => {

            console.log("votingFactoryContract address: ", votingFactory.address)
        });

  });
};
