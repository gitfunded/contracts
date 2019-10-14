import React, { Component } from "react";
import GitHub from 'github-api';
import {UserContext} from '../Context';
import { Button } from "antd";
import GitHubApi from "../utils/githubApi";



class Dashboard extends Component {
    state = {

    };

    ghApi = null;

    componentDidMount() {
        // Checking of the site was redirected from GitHub OAuth login

        const ACCESS_TOKEN = localStorage.getItem("access_token");
        console.log('access token', ACCESS_TOKEN);
        if (ACCESS_TOKEN) {
            this.ghApi = new GitHubApi(ACCESS_TOKEN);
            console.log('did mount');
            this.ghApi.getProfileDetails();
            this.ghApi.getRepoDetails();
        }

    }


    render() {

        return (
          <div/>
        );
    }
}

export default Dashboard;
Dashboard.contextType=UserContext;
