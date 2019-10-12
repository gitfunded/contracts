import getWeb3 from "./getWeb3";

export default class Web3Api {


   selectedAddress = '0x';


    async initWeb3Connection() {

        // Get network provider and web3 instance.
        this.web3 = await getWeb3();

        // Use web3 to get the user's accounts.
        const accounts = await this.web3.eth.getAccounts();
        this.selectedAddress = accounts[0];
        let accountBalanceInWei = await this.web3.eth.getBalance(this.selectedAddress);

        this.accountBalance = await this.web3.utils.fromWei(accountBalanceInWei);
    }

}
module.export = Web3Api;
