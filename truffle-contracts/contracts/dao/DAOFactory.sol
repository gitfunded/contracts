pragma solidity >=0.5.0 < 0.6.0;
import './Governance.sol';

contract DAOFactory {

  uint public daoCount = 0;
  address tokenAddress;
  mapping(address => address[]) public daos;

  constructor(address _tokenAddress) public {

    tokenAddress = _tokenAddress;

  }

  event daoAdded (
        address admin

  );

  function newDAO() public returns (address) {

    Governance dao = new Governance(msg.sender, [tokenAddress], 17280, 35, 35, 35, 70, 10, 3, 1);

    daos[msg.sender].push(address(dao));
    daoCount += 1;

    emit daoAdded(msg.sender);

    return address(dao);
  }

  function getContractAddress() public view returns (address[] memory) {
    return daos[msg.sender];
  }

  function getDAOCount() public view returns (uint) {
    return daoCount;
  }
}
