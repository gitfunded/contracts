pragma solidity >0.5.0<=0.7.0;

interface ICallee {

  function storeValue(uint value) external;
  function getValues() external view returns(uint);
}

