pragma solidity >0.5.0<=0.7.0;

contract Callee {
  uint[] public values;

  function storeValue(uint value) public{
    values.push(value);
  }
  function getValues() view public returns(uint) {
    return values.length;
  }
}
