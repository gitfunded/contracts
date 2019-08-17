import React from 'react';
import { Avatar, Layout, Menu, Dropdown, Icon } from "antd";
import {UserContext} from "../Context";

const { Header } = Layout;

class Menubar extends React.Component {


    constructor(props) {
        super(props);
    }


    handleMenuClick = (e) => {

    };

    menu = (
        <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="0">
            <span> Profile </span>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="1">
            <span> Settings </span>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="2">
            <span> Logout </span>
        </Menu.Item>
        </Menu>
    );

    roleMap = {
        '0': 'Borrower',
        '1': 'Agent',
        '2': 'Lender',
    };
    render() {
    return(

            <Header className="header">
            {/*<div className="nologo" />*/}
            <Dropdown
            overlay={this.menu}
            >
            <a style={{float: "right"}} className="ant-dropdown-link" href="#">
            <Avatar shape="square" icon="user" src={this.context.avatar_url}/>
            </a>
            </Dropdown>
            <Menu theme="dark" mode="horizontal" style={{lineHeight: "64px"}} />
            </Header>
)
}
};

export default Menubar;
Menubar.contextType=UserContext;
