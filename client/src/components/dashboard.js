import React, { Component } from "react";
import { NavLink } from 'react-router-dom';
import AddProjectForm from "./modals/add-project-modal";
import {UserContext} from '../Context';
import { Button, Card, Col, Divider, Dropdown, Icon, Menu, Modal, Row, Skeleton, Spin, Statistic} from "antd";
import GitHubApi from "../utils/githubApi";
import Web3Api from "../utils/web3Api";
import { default as contract } from 'truffle-contract';
import GrantContractArtifact from '../contracts/GitFundedGrant.json';

const web3api = new Web3Api();



class Dashboard extends Component {


    constructor(props) {
        super(props);
        this.ghApi = null;
        this.state = {showFundingForm: this.props.add,
                      spinning: true,
                      projects: []};
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

        this.setState({projects: await this.fetchProjects(),
                       spinning: false});


        // Listening to the "projectAdded" event
        let grantContractInstance = await this.grantContract.deployed();
        grantContractInstance.projectAdded((error, result)=>
        {this.setState({projects: this.state.projects.concat(result.args)})});



    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        if(this.props !== prevProps) {

            this.setState({showFundingForm: this.props.add})
        }

    }






    async fetchProjects()
    {

        try {
            let user_address = web3api.selectedAddress;
            let projectList = [];

             await this.grantContract.deployed().then(async (contractInstance)=>{

                 await contractInstance.getProjectsCount( {from: user_address}).then(async (result)=>{
                    if (result) {
                        console.log(parseInt(result));



                        for (let projectId=0; projectId < parseInt(result); projectId++)
                        {

                            await contractInstance.fetchProject(projectId, {from: user_address}).then((result) => {
                                if (result) {
                                    projectList.push(result);
                                }
                            });

                        }



                    }
                });


            });

            return projectList;
        } catch (err) {
            console.log(err);
            return [];
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

        const skeleton = [];

        for(let i=0; i<6; i++) {
            skeleton.push(<Col span={8}>
                <Card style={{margin: 30}}>
                    <Skeleton active/>
                </Card>
            </Col>)
        };

        return (
            <div>

                <Dropdown overlay={
                    <Menu>
                        {this.state.projects.map( (value, index) => {

                            return (<Menu.Item
                                key={index} >
                                {/* The title value is returned in the second index*/}
                                {value[1]}

                            </Menu.Item>)
                        })
                        }
                    </Menu>

                } placement="bottomCenter">
                    <Button> Public Projects</Button>
                </Dropdown>


                {this.state.spinning ?
                <Spin size="large" spinning={true} indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />}>
                    <div style={{ background: '#ECECEC', padding: "30px"}}>
                    <Row gutter={16}>
                        {skeleton}

                    </Row>
                    </div>
                </Spin>:

                    <div style={{ background: '#ECECEC', padding: "30px"}}>
                    <Row gutter={16}>
                        {this.state.projects.map((project,  index) => {
                        return(<Col span={8}>
                            <NavLink to={"/projects/"+index}>
                            <Card title={project[1]}
                                  bordered={false}
                                  style={{margin: 30}}
                                  hoverable={true}>
                                #ZeroKnowledge; Encrypted Realtime Collaboration; built by XWiki Labs; Working to bring new tools to protect your Privacy ✊❤
                                <Divider />
                                <Row gutter={16}>

                                    <Col span={12}>
                                        <Card>
                                            <Statistic
                                                title="Budget"
                                                value={project[2]}
                                                valueStyle={{ color: '#3f8600', fontSize: 15}}
                                                suffix="$"
                                            />
                                        </Card>

                                    </Col>
                                    <Col span={12}>
                                        <Card>
                                            <Statistic
                                                title="Funded"
                                                value={web3api.web3.utils.fromWei(project[3])}
                                                precision={2}
                                                valueStyle={{ color: '#2e4ccf', fontSize: 18, font: 15}}
                                                suffix="ETH"
                                            />
                                        </Card>
                                    </Col>

                                </Row>
                            </Card>
                            </NavLink>

                        </Col>)
                        })
                        }
                    </Row>
                </div>
                    }


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
