pragma solidity >=0.4.21 <0.7.0;

import "@ensdomains/ens/contracts/ENSRegistry.sol";
import "@ensdomains/ens/contracts/FIFSRegistrar.sol";
import "@ensdomains/resolver/contracts/PublicResolver.sol";
import "./ENSSubdomainRegistrar.sol";

// Construct a set of test ENS contracts.
contract ENSProxy {
    bytes32 constant TLD_LABEL = keccak256("eth");
    bytes32 constant RESOLVER_LABEL = keccak256("resolver");
    bytes32 constant ADDR_LABEL = keccak256("addr");

    address public owner;

    ENSRegistry public ens;
    FIFSRegistrar public fifsRegistrar;
    ENSSubdomainRegistrar public sdRegistrar;


    PublicResolver public publicResolver;

    modifier onlyOwner() {
        require(msg.sender == owner, "Un authorised");
        _;
    }

    function namehash(bytes32 node, bytes32 label) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(node, label));
    }

    constructor() public {

        owner = msg.sender;
        ens = new ENSRegistry();
        publicResolver = new PublicResolver(ens);

        // Set up the resolver
        bytes32 resolverNode = namehash(bytes32(0), RESOLVER_LABEL);

        ens.setSubnodeOwner(bytes32(0), RESOLVER_LABEL, address(this));
        //ens.setSubnodeOwner(resolverNode,RESOLVER_LABEL, address(this));
        ens.setResolver(resolverNode, address(publicResolver));
        publicResolver.setAddr(resolverNode, address(publicResolver));

        // Create a FIFS registrar for the TLD
        fifsRegistrar = new FIFSRegistrar(ens, namehash(bytes32(0), TLD_LABEL));

        ens.setSubnodeOwner(bytes32(0), TLD_LABEL, address(fifsRegistrar));


                // Setup .eth TLD
        // ens.setSubnodeOwner(ENS_ROOT, ETH_TLD_LABEL, this);

        // // Setup public resolver
        // PublicResolver resolver = new PublicResolver(ens);
        // ens.setSubnodeOwner(ETH_TLD_NODE, PUBLIC_RESOLVER_LABEL, this);
        // ens.setResolver(PUBLIC_RESOLVER_NODE, resolver);
        // resolver.setAddr(PUBLIC_RESOLVER_NODE, resolver);

         // ens.setOwner(TLD_LABEL, owner);
         // ens.setOwner(bytes32(0), owner);

    }

    function setENS(ENSRegistry _ens) public onlyOwner {
        ens = _ens;
    }

    function setFIFSRegistrar(ENSRegistry _ens) public onlyOwner {
        ens = _ens;
    }

    function deploySubdomainRegistrar(bytes32 _rootNode) public onlyOwner {
        sdRegistrar = new ENSSubdomainRegistrar(ens);
        fifsRegistrar.register(_rootNode, address(sdRegistrar));
        sdRegistrar.setRootNode(namehash(namehash(bytes32(0), TLD_LABEL), _rootNode));
    }
    function getsdRegistrar() external view returns (ENSSubdomainRegistrar) {
        return sdRegistrar;
    }

}
