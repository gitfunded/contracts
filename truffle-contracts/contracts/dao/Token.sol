pragma solidity >=0.5.0 < 0.6.0;

import "./oz/ERC20.sol";

contract Token is ERC20 {
  constructor(uint256 supply) public {
    _mint(msg.sender, supply);
  }
}
