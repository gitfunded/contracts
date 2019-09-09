import React, { Component } from "react";
import GitHub from 'github-api';
import {UserContext} from '../Context';
import { Button } from "antd";



class Dashboard extends Component {
    state = {

    };
    componentDidMount() {
        // Checking of the site was redirected from GitHub OAuth login

        const ACCESS_TOKEN = localStorage.getItem("access_token");
        console.log('access token', ACCESS_TOKEN);
        if (ACCESS_TOKEN) {
            this.getProfileDetails(ACCESS_TOKEN);
        }

    }

    getProfileDetails(accessToken) {
        let gh = new GitHub({
            token: accessToken

        });

        let me = gh.getUser();
        me.getProfile(function(err, profile) {
            console.log(profile);
        });
    }

    render() {

        return (
          <div/>
        );
    }
}

export default Dashboard;
Dashboard.contextType=UserContext;
