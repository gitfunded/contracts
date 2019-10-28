import React from "react";
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Button, Layout, Modal, Icon, Spin, Alert, Row, Col } from "antd";
import Contract from './components/contract.js';
import Menubar from './components/menubar.js';
import Profile from './components/profile.js';
import Project from './components/project.js';
import SideMenuBar from "./components/side-menubar.js";
import PageNotFoundError from './components/404.js';
import "antd/dist/antd.css";
import "./App.css";
import GitHub from "github-api";
import {UserContext} from './Context';
import Dashboard from "./components/dashboard";

const { Content, Header } = Layout;

const CLIENT_ID = "69bc88033c4b1bc2b4dc";
const REDIRECT_URI = "http://localhost:3000/";

class App extends React.Component {

  constructor(props) {
    super(props);


    this.state = {
        login: false,
        confirmLoading: false,
        me: {},
        loading: true,
        accessToken: null,
        collapsed: false
    }
  }

    componentDidMount() {
        // Checking of the site was redirected from GitHub OAuth login

        const ACCESS_TOKEN = localStorage.getItem("access_token") && localStorage.getItem("access_token") !=="undefined" ? localStorage.getItem("access_token") : null;
        this.setState({accessToken: ACCESS_TOKEN});
        console.log('access token', ACCESS_TOKEN);
        if (ACCESS_TOKEN && ACCESS_TOKEN!=="undefined") {
            this.getProfileDetails(ACCESS_TOKEN);
            this.setState({
                login: true
            });
        }
        const code =
            window.location.href.match(/\?code=(.*)/) &&
            window.location.href.match(/\?code=(.*)/)[1];

        if (code) {

            fetch(`https://gitfund-oauth.herokuapp.com/authenticate/${code}`)
                .then(response => response.json())
                .then(({ token }) => {
                    this.setState({
                        accessToken: token
                    });

                    localStorage.setItem("access_token", token);

                    this.getProfileDetails(token);

                });
        }
    }

    getProfileDetails(accessToken) {
        let gh = new GitHub({
            token: accessToken

        });

        let me = gh.getUser();
        let context = this;
        me.getProfile(function(err, profile) {
            context.setState({me: profile, loading: false});
        });
    }




    handleOk = () => {
        this.setState({
            confirmLoading: true,
        });
        setTimeout(() => {
            this.setState({
                visible: false,
                confirmLoading: false,
                login: true,
            });
        }, 1000);
    };

    handleCancel = () => {
        this.setState({
            visible: false,
        });
    };

    toggleSideMenu = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };


    showConfirm() {
      return(
        <Modal
            title={<div><Row className="logo" /><Row span={12} style={{marginLeft: 18}}>User Login</Row></div>}
            visible={!this.state.login}
            onOk={this.handleOk}
            confirmLoading={this.state.confirmLoading}
            onCancel={this.handleCancel} >

            <div>

                {this.state.accessToken ?

                    <Spin spinning={this.state.loading}>
                        <Alert
                            message="You are logged in as:"
                            description={<span><Icon style={{ fontSize: '24px', color: '#08c' }}  type="user"/> {this.state.me.login}</span>}
                            type="info"
                            showIcon
                        />
                        Do you want to continue?
                    </Spin>:
                    <Button
                    type="primary"
                    icon="github"
                    style={{backgroundColor: '#444'}}

                    onClick={() => {window.location.href=`https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=user&redirect_uri=${REDIRECT_URI}`}} >

                    Sign in with GitHub

                </Button>}






            </div>



        </Modal>
      );
    }

  render() {

    return (
        this.state.login ?
            <UserContext.Provider value={this.state.me}>
                <BrowserRouter>
                    <Layout>
                        <Menubar/>
                        <Layout>
                            <SideMenuBar collapsed={this.state.collapsed}/>
                            <Layout style={{padding: "0 24px 24px"}}>
                                <Header style={{ background: '#fff', paddingLeft: 20, height: 50 }}>
                                    <Icon
                                        className="trigger"
                                        type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                                        onClick={this.toggleSideMenu}
                                    />
                                </Header>
                                <Content style={{
                                    background: "#fff",
                                    padding: 24,
                                    margin: "16px 0px 0px 0px",
                                    minHeight: 280
                                }}>
                                    <Switch>
                                        <Route path="/" component={Dashboard} exact/>
                                        <Route path="/profile" component={Profile} exact/>
                                        <Route path="/add" render={(props) => <Dashboard {...props} add={true} />} exact/>
                                        <Route path="/projects" component={Project} />
                                        <Route component={PageNotFoundError}/>
                                    </Switch>
                                </Content>
                            </Layout>
                        </Layout>
                    </Layout>
                </BrowserRouter>
            </UserContext.Provider>:
            <div>
                {this.showConfirm()}
            </div>

    );
  }
}


export default App;
