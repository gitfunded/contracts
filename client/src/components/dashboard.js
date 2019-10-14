import React, { Component } from "react";
import AddProjectForm from "./modals/add-project-modal";
import {UserContext} from '../Context';
import { Modal } from "antd";
import GitHubApi from "../utils/githubApi";



class Dashboard extends Component {


    constructor(props) {
        super(props);
        this.ghApi = null;
        this.state = {showFundingForm: this.props.add};
    }



    componentDidMount() {
        // Checking of the site was redirected from GitHub OAuth login

        const ACCESS_TOKEN = localStorage.getItem("access_token");
        if (ACCESS_TOKEN) {
            this.ghApi = new GitHubApi(ACCESS_TOKEN);
            console.log('did mount');
            this.ghApi.getProfileDetails();
            this.ghApi.getRepoDetails();
        }

    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        if(this.props !== prevProps) {

            this.setState({showFundingForm: this.props.add})
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
