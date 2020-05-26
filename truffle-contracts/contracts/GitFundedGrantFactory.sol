pragma solidity >=0.5.0 < 0.6.0;
import './GitFundedGrant.sol';
import "./ens/ENSSubdomainRegistrar.sol";


contract GitFundedGrantFactory {
  uint public projectCount = 0;
  address bountyAddress; // This is actually BountiesMetaTxRelayer address
  address tokenAddress;
  address ensSubdomainRegistrarAddress;
  ENSSubdomainRegistrar esr;
  mapping(address => address[]) public projects;

  constructor(address _bountyAddress, address _tokenAddress,address _ensSubdomainRegistrar) public {

    bountyAddress = _bountyAddress;
    tokenAddress = _tokenAddress;
    ensSubdomainRegistrarAddress=_ensSubdomainRegistrar;
    esr=ENSSubdomainRegistrar(_ensSubdomainRegistrar);
  }


  event projectAdded (
        string repoId,
        string title,
        uint budget, // In dollars
        uint availableFund, // In Ether
        address admin

  );

  function newProject(
    string memory repoId, string memory title, uint budget,bytes32 label) public returns (address) {

    GitFundedGrant project = new GitFundedGrant(
      repoId,
      title,
      budget,
      msg.sender,
      bountyAddress,
      tokenAddress
    );
    // bytes32 label=keccak256(abi.encode(title));
    // bytes32 label1=keccak256("testRepo title");
    esr.createName(label,msg.sender);

    projects[msg.sender].push(address(project));
    projectCount += 1;

    emit projectAdded(repoId, title, budget, 0, msg.sender);

    return address(project);
  }

  function getContractAddress() public view returns (address[] memory) {
    return projects[msg.sender];
  }

  function getProjectsCount() public view returns (uint) {
    return projectCount;
  }

  function getEnsAddress() public view returns (address) {
    return ensSubdomainRegistrarAddress;
  }
}
