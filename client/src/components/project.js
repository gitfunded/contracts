import React, { Component } from "react";
import AddExpenseForm from "./modals/add-expense-modal";
import {UserContext} from '../Context';
import { Button, Col, Divider, InputNumber, Modal, Popover, Row, Tabs } from "antd";
import GitHubApi from "../utils/githubApi";
import Web3Api from "../utils/web3Api";
import ExchangeRateApi from '../utils/exchangeRateApi';
import { default as contract } from 'truffle-contract';
import GrantContractArtifact from '../contracts/GitFundedGrant.json';

const web3api = new Web3Api();
const exchangeRate = new ExchangeRateApi();
const { TabPane } = Tabs;


class Project extends Component {


    constructor(props) {
        super(props);
        this.ghApi = null;
        this.state = {showExpenseForm: false,
                      popOverVisible: false,
                      expenses: [],
                      fundValue: 0};
    }



    async componentDidMount() {
        // Checking of the site was redirected from GitHub OAuth login

        const ACCESS_TOKEN = localStorage.getItem("access_token");
        this.projectId = this.props.location.pathname.split('/')[2];

        if (ACCESS_TOKEN) {
            this.ghApi = new GitHubApi(ACCESS_TOKEN);
            this.ghApi.getProfileDetails();
            this.ghApi.getRepoDetails();
        }

        await web3api.initWeb3Connection();
        this.grantContract = contract(GrantContractArtifact);
        this.grantContract.setProvider(web3api.web3.currentProvider);
        exchangeRate.fetchEtherPrice(1000).then((amount) => {this.setState({fundValue: amount})});
        this.setState({expenses: await this.fetchExpenses()});

    }


    fundAccountForm() {
        return(

            <div>
                <p>
                    Enter an amount to fund
                </p>
                <Row>
                <Col span={16}>
                <InputNumber
                    defaultValue={1000000}
                    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    onChange={(amount)=>{exchangeRate.fetchEtherPrice(amount).then((value) => {this.setState({fundValue:value})})}}
                />
                </Col>
                <Col span={8}>
                    {this.state.fundValue} ETH
                </Col>
                </Row>
                <Divider/>
              <Row>
                <div style={{alignContent: "center"}}>

                    <Button type="primary" onClick={() => {parseInt(this.fundProject(this.projectId, this.state.fundValue))}}>
                        FUND
                    </Button>
                </div>
              </Row>

            </div>

        )
    }

    fundProject(projectId, amount) {
        try {
            let user_address = web3api.selectedAddress;
            this.grantContract.deployed().then(function(contractInstance) {

                contractInstance.fundProject(projectId, {gas: 1400000, from: user_address, value: web3api.web3.utils.toWei(amount.toString(),"ether")}).then(function(c) {
                    console.log(c.toLocaleString());
                });
            });
        }

        catch (err) {
            console.log(err);
        }


    }

    async fetchExpenses()
    {

        try {
            let user_address = web3api.selectedAddress;
            let expenseList = [];

            await this.grantContract.deployed().then(async (contractInstance)=>{

                await contractInstance.getExpensesCount( this.projectId, {from: user_address}).then(async (result)=>{
                    if (result) {
                        console.log(parseInt(result));

                        for (let expenseId=0; expenseId < parseInt(result); expenseId++)
                        {

                            await contractInstance.expenses(this.projectId, expenseId, {from: user_address}).then((result) => {
                                if (result) {
                                    expenseList.push(result);
                                }
                            });

                        }
                    }
                });


            });

            return expenseList;
        } catch (err) {
            console.log(err);
            return [];
        }


    }

    handleVisibleChange = popOverVisible => {
        this.setState({ popOverVisible });
    };

    handleOk = e => {
        this.setState({
            showExpenseForm: false

        });
    };

    handleCancel = e => {
        this.setState({
            showExpenseForm: false

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
                          <Popover
                              content={this.fundAccountForm()}
                              title="Fund Account"
                              trigger="click"
                              visible={this.state.popOverVisible}
                              onVisibleChange={this.handleVisibleChange}
                          >
                      <Button type="primary" shape="round" icon="dollar">
                          Fund the Project
                      </Button>
                          </Popover>

                      <Button shape="round" icon="file-text" onClick={() => {this.setState({showExpenseForm: true})}}>
                          Submit Expense
                      </Button>
                      </Row>

                  </TabPane>
                  <TabPane tab="Issue Board" key="2">
                      Issue Board
                  </TabPane>
                  <TabPane tab="Updates" key="3">
                      {this.state.expenses.map((expense) => {return (<p>An expense for <b>{expense[0]}</b> amounting was added aounting $<b>{expense[1].toString()}</b></p>)})}
                  </TabPane>
              </Tabs>

              <Modal
                  title="Add a project expense"
                  visible={this.state.showExpenseForm}
                  onOk={this.handleOk}
                  footer={null}
                  onCancel={this.handleCancel} >

                  <AddExpenseForm handleOk={this.handleOk} projectId={this.projectId} />

              </Modal>


          </div>
        );
    }
}

export default Project;
Project.contextType=UserContext;
