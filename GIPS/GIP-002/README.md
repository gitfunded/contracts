# Contract interactions

## Abstract
Proposal to optimize the contracts with interfaces the abstract contracts

## Motivation
Reduce the complexity and size of the contracts by making the contract light weight. Interoperability can be
achieved with call, deligatecall or by creating contract instances with the help of interfaces.

Reference article: https://zupzup.org/smart-contract-interaction/

## Specification

### Example

A simple example with Callee and Caller contracts

Run Ganache local blockchain

```
cd example

truffle migrate

truffle test
```
