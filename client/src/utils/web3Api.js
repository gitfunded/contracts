import Web3 from "web3";

export default class Web3Api {


   selectedAddress = '0x';


    async initWeb3Connection() {

        // Get network provider and web3 instance.

        if (window.ethereum) {
            this.web3 = new Web3(window.ethereum);
            try {
                // Request account access if needed
                await window.ethereum.enable();
                // Acccounts now exposed

            } catch (error) {

            }
        }

        // Legacy dapp browsers...
        else if (window.web3) {
            // Use Mist/MetaMask's provider.
            this.web3 = window.web3;
            console.log("Injected web3 detected.");
        }

        // Fallback to localhost; use dev console port by default...
        else {
            const provider = new Web3.providers.HttpProvider(
                "http://127.0.0.1:8545"
            );
            this.web3 = new Web3(provider);
            console.log("No web3 instance injected, using Local web3.");

        }


        // Use web3 to get the user's accounts.
        const accounts = await this.web3.eth.getAccounts();
        this.selectedAddress = accounts[0];
        let accountBalanceInWei = await this.web3.eth.getBalance(this.selectedAddress);
        this.accountBalance = await this.web3.utils.fromWei(accountBalanceInWei);
    }

}
module.export = Web3Api;
