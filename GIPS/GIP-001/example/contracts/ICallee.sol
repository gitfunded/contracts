pragma solidity >0.5.0<=0.7.0;

abstract contract ICallee {

  function storeValue(uint) virtual external;
  function getValues() virtual external returns(uint);
}

