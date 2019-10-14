import React from 'react';
import { connect } from 'react-redux';
import 'antd/dist/antd.css';
import {
  Form,
  Select,
  Input,
  InputNumber,
  DatePicker,
  Button,
} from 'antd';
import {UserService} from "../services";
import {message} from "antd/lib/index";
import {UserContext} from "../Context";

const { Option } = Select;

const userService = new UserService();

class AddProject extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
        confirmLoading: false,
    }
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
          values["shared_id"] = this.props.me.owningKey;

          this.setState({
              confirmLoading: true,
          });

          userService.updateProjectInfo(values)
              .then(
                  userList => {
                      if (userList.meta.status) {

                          setTimeout(() => {
                              this.setState({
                                  confirmLoading: false,
                              });
                              message.success('Project added successfully ', 1);
                              this.props.handleOk();
                          }, 1000);
                      }
                      else {
                          console.log("Error while fetching user details:", userList.meta.message);
                      }}
              ).catch(
              error => {
                  console.log("Error while fetching user details:", error);
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
    const config = {
        rules: [{ type: 'object', message: 'Please select date!' }],
      };
    return (
      <Form {...formItemLayout} onSubmit={this.handleSubmit}>

          <Form.Item label="Project Title" labelAlign="left">
              {getFieldDecorator('name', {
                  rules: [{required: true, message: 'Please input the title of the project'}],
              })(<Input/>)}
          </Form.Item>

          <Form.Item label="Fund Source" labelAlign="left">
              {getFieldDecorator('fund_source', {
                  rules: [{required: true, message: 'Please input the source of the fund'}],
              })(<Input/>)}
          </Form.Item>

          <Form.Item label="Projected Revenue">
              {getFieldDecorator('revenue', { initialValue: 13 })(<InputNumber min={1} max={1000} />)}
            <span className="ant-form-text"> Million Dollars </span>
          </Form.Item>

          <Form.Item label="Projected Net Income">
              {getFieldDecorator('net_income', { initialValue: 13 })(<InputNumber min={1} max={1000} />)}
              <span className="ant-form-text"> Million Dollars </span>
          </Form.Item>

          <Form.Item label="Projected Total Assets">
              {getFieldDecorator('total_assets', { initialValue: 13 })(<InputNumber min={1} max={1000} />)}
              <span className="ant-form-text"> Million Dollars </span>
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

AddProjectForm.contextType=UserContext;
