import React from 'react';
import 'antd/dist/antd.css';
import {
  Form,
  Select,
  Input,
  InputNumber,
  Button,
} from 'antd';

import Web3Api from "../../utils/web3Api";
import { default as contract } from 'truffle-contract';
import GrantContractArtifact from '../../contracts/GitFundedGrant.json';

const web3api = new Web3Api();

const { Option } = Select;


class AddExpense extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
        repoList: [],
        confirmLoading: false,
    };


    this.setRepoDetails = this.setRepoDetails.bind(this);
  }

    async componentDidMount() {

        await web3api.initWeb3Connection();
        this.grantContract = contract(GrantContractArtifact);
        this.grantContract.setProvider(web3api.web3.currentProvider);

    }

    addExpense(projctId, expenseTitle, amount) {
        try {
            let user_address = web3api.selectedAddress;
            return this.grantContract.deployed().then(function(contractInstance) {

                return contractInstance.addExpense(projctId, expenseTitle, amount, {gas: 1400000, from: user_address}).then(function(c) {

                    return c.toLocaleString();
                });
            });

        }

        catch (err) {
            console.log(err);
        }




    }


    setRepoDetails(repos) {
      console.log('called', this.state.repoList);

        let repoList = [];
        repos.forEach((repo) => {
            repoList.push({'name': repo.name, 'id': repo.id})
        });
        this.setState({repoList:  this.state.repoList.concat(repoList)});

    }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
          this.setState({
              confirmLoading: true,
          });
          this.addExpense(this.props.projectId, values.expense_title, parseInt(values.expense_amount)).then((result)=>{
              this.setState({
                  confirmLoading: false
              });
              this.props.handleOk();

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


          <Form.Item label="Expense Title" labelAlign="left">
              {getFieldDecorator('expense_title', {
                  rules: [{required: true, message: 'Please provide a title for the expense'}],
              })(<Input/>)}
          </Form.Item>

          <Form.Item label="Expense Amount" labelAlign="left">
              {getFieldDecorator('expense_amount', { initialValue: 100 })(<InputNumber
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

const AddExpenseForm = Form.create({ name: 'validate_other' })(AddExpense);

export default AddExpenseForm;

