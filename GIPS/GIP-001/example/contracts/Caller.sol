pragma solidity >0.5.0<=0.7.0;

import './ICallee.sol';

contract Caller {

  address public calleeAddress;
  ICallee c;

  constructor(address _calleeAddress) public {

    calleeAddress = _calleeAddress;
    c = ICallee(calleeAddress);
  }



  function store() public {
//    Callee c = Callee(calleeAddress);
    c.storeValue(100);
  }

  function get() public view returns(uint)  {

    uint values = c.getValues();
    return uint(values);
  }

  // function someUnsafeAction(address addr) public {
  //     addr.call(bytes4(keccak256("storeValue(uint256)")), 100);
  // }
}




