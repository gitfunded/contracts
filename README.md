# GitFunded client web application

![version](https://img.shields.io/badge/version-0.1.0beta-blue)
[![docs](https://img.shields.io/badge/docs-0.1.0-green)](https://docs.gitfunded.consensolabs.com)
![Contributors](https://img.shields.io/github/contributors/gitfunded/gitfunded-web)
[![Follow](https://img.shields.io/twitter/follow/consensolabs?style=social&logo=twitter)](https://twitter.com/consensolabs)

## Quick Start

Install contract framework and private blockchain

Truffle and Ganache can be installed as a node module.

```text
$ npm install -g truffle
```

```text
$ npm install -g ganache-cli
```

```text
git clone https://github.com/gitfunded/gitfunded-web
```

### Test, compile and deploy the contract

```text
 $ cd gitfunded/gitfunded-web/truffle-contracts
 $ truffle test --network development
 $ truffle migrate --network development
```

### Start the client application

Install the node dependencies.

```text
yarn install
```

Run the app in the development mode.<br>

```text
cd gitfunded/gitfunded-web/client
yarn start
```
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.


Finally, the build for the production can also be generated 

```text
yarn build
```
