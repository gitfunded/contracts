import React, { Component } from 'react';
import crypto from 'crypto';
import Web3 from 'web3';
import getWeb3 from "../utils/getWeb3";
import { default as contract } from 'truffle-contract';
import contract_artifacts from '../contracts/Hello.json';


class Contract extends Component {
    constructor(props) {
        super(props);

        this.state = {isConnected: false,
            show: false,
            userName: null};


    }
    componentWillMount() {
        if(this.web3 && this.web3.isConnected()) {
            this.setState({isConnected: true});

        }
    }

    async componentDidMount(){
        await this.initWeb3Connection();
        this.hello = contract(contract_artifacts);
        this.hello.setProvider(this.web3.currentProvider);
        this.storeName(this.web3.utils.asciiToHex("Test Store"));
        this.queryName();
    }

    async initWeb3Connection() {
        // const web3 = window.web3;
        // Get network provider and web3 instance.
        this.web3 = await getWeb3();

        // Use web3 to get the user's accounts.
        const accounts = await this.web3.eth.getAccounts();
        this.user_address = accounts[0];
    }




    storeName(assetID)
    {

        try {
            let user_address = this.user_address;
            this.hello.deployed().then(function(contractInstance) {

                contractInstance.storeName(assetID, {gas: 1400000, from: user_address}).then(function(c) {
                    console.log(c.toLocaleString());
                });
            });
        }

        catch (err) {
            console.log(err);
        }

    }


    queryName()
    {


        try {
            let user_address = this.user_address;

            this.hello.deployed().then((contractInstance)=>{

                contractInstance.queryName( {from: user_address}).then((c)=>{
                if (c) {
                    console.log(this.web3.utils.hexToAscii(c.toLocaleString()));
                }
            });


        });
        } catch (err) {
            console.log(err);
        }
    }



    render() {
        return (
            <div>
            </div>
    );
    }
}
export default Contract;
