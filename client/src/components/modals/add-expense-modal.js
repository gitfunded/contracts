import React from 'react';
import 'antd/dist/antd.css';
import {
  Button,
  Col,
  Form,
  Select,
  Input,
  InputNumber,
  Row
} from 'antd';
import ExchangeRateApi from '../../utils/exchangeRateApi';
import Web3Api from "../../utils/web3Api";
import { default as contract } from 'truffle-contract';
import GrantContractArtifact from '../../contracts/GitFundedGrant.json';

const web3api = new Web3Api();
const exchangeRate = new ExchangeRateApi();
const { Option } = Select;


class AddExpense extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
        repoList: [],
        confirmLoading: false,
        expenseAmount: 0
    };


    this.setRepoDetails = this.setRepoDetails.bind(this);
  }

    async componentDidMount() {

        await web3api.initWeb3Connection();
        this.projectInstance = new web3api.web3.eth.Contract(GrantContractArtifact.abi, this.props.projectId);

        exchangeRate.fetchEtherPrice(100).then((amount) => {this.setState({expenseAmount: amount})});

    }

    async addExpense(expenseTitle, amount) {

        try {
            let user_address = web3api.selectedAddress;
            await this.projectInstance.methods.addExpense(expenseTitle, web3api.web3.utils.toWei(amount.toString(), "ether")).send({gas: 1400000, from: user_address});
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
          this.addExpense(values.expense_title, this.state.expenseAmount).then((result)=>{
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
              {getFieldDecorator('expense_amount', { initialValue: 100 })(
                  <Row>
                  <Col span={8}>
                  <InputNumber
                  defaultValue={100}
                  min={1}
                  max={100000}
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  onChange={(amount)=>{exchangeRate.fetchEtherPrice(amount).then((value) => {this.setState({expenseAmount:value})})}}
                  />
                  </Col>
                  <Col  span={8}>
                      {this.state.expenseAmount} ETH
                  </Col>

                  </Row>)}

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

