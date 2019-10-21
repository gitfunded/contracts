import React, { Component } from "react";
import AddProjectForm from "./modals/add-project-modal";
import {UserContext} from '../Context';
import { Modal } from "antd";
import GitHubApi from "../utils/githubApi";
import Web3Api from "../utils/web3Api";
import { default as contract } from 'truffle-contract';
import GrantContractArtifact from '../contracts/GitFundedGrant.json';

const web3api = new Web3Api();



class Dashboard extends Component {


    constructor(props) {
        super(props);
        this.ghApi = null;
        this.state = {showFundingForm: this.props.add};
    }



    async componentDidMount() {
        // Checking of the site was redirected from GitHub OAuth login

        const ACCESS_TOKEN = localStorage.getItem("access_token");
        if (ACCESS_TOKEN) {
            this.ghApi = new GitHubApi(ACCESS_TOKEN);
            console.log('did mount');
            this.ghApi.getProfileDetails();
            this.ghApi.getRepoDetails();
        }

        await web3api.initWeb3Connection();
        this.grantContract = contract(GrantContractArtifact);
        this.grantContract.setProvider(web3api.web3.currentProvider);
        this.fetchProjects();

    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        if(this.props !== prevProps) {

            this.setState({showFundingForm: this.props.add})
        }

    }


    fetchProjects()
    {


        try {
            let user_address = web3api.selectedAddress;

            this.grantContract.deployed().then((contractInstance)=>{

                contractInstance.getProjectsCount( {from: user_address}).then((result)=>{
                    if (result) {
                        console.log(parseInt(result));

                        for (let projectId=0; projectId < parseInt(result); projectId++)
                        {

                            contractInstance.fetchProject(projectId, {from: user_address}).then((result) => {
                                if (result) {
                                    console.log(result);
                                }
                            });
                        }

                    }
                });


            });
        } catch (err) {
            console.log(err);
        }
    }

    handleOk = e => {
        this.setState({
            showFundingForm: false

        });
    };

    handleCancel = e => {
        this.setState({
            showFundingForm: false

        });
    };


    render() {

        return (
            <div>

                <Modal
                    title="Get your project funded"
                    visible={this.state.showFundingForm}
                    onOk={this.handleOk}
                    footer={null}
                    onCancel={this.handleCancel} >

                    <AddProjectForm handleOk={this.handleOk} />

                </Modal>
            </div>
        );
    }
}

export default Dashboard;
Dashboard.contextType=UserContext;
