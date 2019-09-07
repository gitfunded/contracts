pragma solidity ^0.5.0;

contract Hello {

  mapping (address => bytes) public userDetails;

  function queryName() view public returns (bytes memory) {

    return userDetails[msg.sender];
  }

  function storeName(bytes memory name) public {

    userDetails[msg.sender] = name;

  }

}
