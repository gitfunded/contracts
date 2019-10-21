import React from 'react';
import 'antd/dist/antd.css';
import {
  Form,
  Select,
  Input,
  InputNumber,
  Button,
} from 'antd';

import GitHubApi from "../../utils/githubApi";
import Web3Api from "../../utils/web3Api";
import { default as contract } from 'truffle-contract';
import GrantContractArtifact from '../../contracts/GitFundedGrant.json';

const web3api = new Web3Api();

const { Option } = Select;


class AddProject extends React.Component {

  constructor(props) {
    super(props);

    this.ghApi = null;

    this.state = {
        repoList: [],
        confirmLoading: false,
    };


    this.setRepoDetails = this.setRepoDetails.bind(this);
  }

    async componentDidMount() {
        // Checking of the site was redirected from GitHub OAuth login

        const ACCESS_TOKEN = localStorage.getItem("access_token");
        if (ACCESS_TOKEN) {
            this.ghApi = new GitHubApi(ACCESS_TOKEN);
            this.ghApi.getRepoDetails(this.setRepoDetails);
        }
        await web3api.initWeb3Connection();
        this.grantContract = contract(GrantContractArtifact);
        this.grantContract.setProvider(web3api.web3.currentProvider);

    }

    addProject(repoId, projectTitle) {
        try {
            let user_address = web3api.selectedAddress;
            this.grantContract.deployed().then(function(contractInstance) {

                contractInstance.addProject(repoId, projectTitle, {gas: 1400000, from: user_address}).then(function(c) {
                    console.log(c.toLocaleString());
                });
            });
        }

        catch (err) {
            console.log(err);
        }


    }


    setRepoDetails(repos) {

        let repoList = [];
        repos.forEach((repo) => {
            repoList.push({'name': repo.name, 'id': repo.id})
        });
        this.setState({repoList});

    }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
          console.log(values);
          this.addProject(values.repo_id.toString(), values.project_title);

          this.setState({
              confirmLoading: true,
          });

      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };

    return (
      <Form {...formItemLayout} onSubmit={this.handleSubmit}>

          <Form.Item label="Select a Repo" labelAlign="left">
              {getFieldDecorator('repo_id', {
                  rules: [{required: true, message: 'Please select a GitHub repository'}],
              })(<Select showSearch
                         placeholder="Select a Repo"
                         filterOption={(input, option) =>
                             option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                         }>
                      {
                          this.state.repoList.map((repo) =>{
                                return <Option key={repo.id} value={repo.id}>{repo.name}</Option>
                        })}
              </Select>)}
          </Form.Item>

          <Form.Item label="Project Title" labelAlign="left">
              {getFieldDecorator('project_title', {
                  rules: [{required: true, message: 'Please provide a title for the project'}],
              })(<Input/>)}
          </Form.Item>

          <Form.Item label="Project Budget" labelAlign="left">
              {getFieldDecorator('project_budget', { initialValue: 1000 })(<InputNumber
                  min={1}
                  max={100000}
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
              />)}

          </Form.Item>

            <Form.Item wrapperCol={{ span: 24}}>
                <div style={{float: "right"}}>
                <Button type="secondary" onClick={e => { this.props.form.resetFields() }} style={{marginRight:'15px'}}>
                    CLEAR
                </Button>
                <Button type="primary" htmlType="submit" loading={this.state.confirmLoading}>
                    SUBMIT
                </Button>
                </div>
            </Form.Item>
      </Form>
    );
  }
}

const AddProjectForm = Form.create({ name: 'validate_other' })(AddProject);

export default AddProjectForm;

