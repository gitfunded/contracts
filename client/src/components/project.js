import React, { Component } from "react";
import {UserContext} from '../Context';
import { Button, Divider, Row, Tabs } from "antd";
import GitHubApi from "../utils/githubApi";

const { TabPane } = Tabs;


class Project extends Component {


    constructor(props) {
        super(props);
        this.ghApi = null;
        this.state = {showFundingForm: this.props.add};
    }



    componentDidMount() {
        // Checking of the site was redirected from GitHub OAuth login

        console.log(this.props.location.pathname.split('/')[2]);

        const ACCESS_TOKEN = localStorage.getItem("access_token");
        console.log('access token', ACCESS_TOKEN);
        if (ACCESS_TOKEN) {
            this.ghApi = new GitHubApi(ACCESS_TOKEN);
            console.log('did mount');
            this.ghApi.getProfileDetails();
            this.ghApi.getRepoDetails();
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

              <Tabs defaultActiveKey="1" onChange={()=> {}}>
                  <TabPane tab="About" key="1">
                      <Row>
                          #ZeroKnowledge; Encrypted Realtime Collaboration; built by XWiki Labs; Working to bring new tools to protect your Privacy ✊❤
                      </Row>
                      <Divider />
                      <Row>

                      <Button type="primary" shape="round" icon="download">
                          Fund the Project
                      </Button>

                      <Button shape="round">
                          Submit Expense
                      </Button>
                      </Row>

                  </TabPane>
                  <TabPane tab="Issue Board" key="2">
                      Issue Board
                  </TabPane>
                  <TabPane tab="Updates" key="3">
                      Updates
                  </TabPane>
              </Tabs>


          </div>
        );
    }
}

export default Project;
Project.contextType=UserContext;
