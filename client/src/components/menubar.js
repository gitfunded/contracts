import React from 'react';
import { NavLink } from 'react-router-dom';
import { Avatar, Layout, Menu, Dropdown, Icon, Row, Col } from "antd";
import {UserContext} from "../Context";

const { Header } = Layout;

class Menubar extends React.Component {


    constructor(props) {
        super(props);
    }


    handleMenuClick = (e) => {
        console.log(e);

    };



    menu = (
        <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="0">
            <span> Profile </span>
        </Menu.Item>

        <Menu.Item key="1">
            <NavLink to="/add">
            <span> Add a project </span>
            </NavLink>
        </Menu.Item>

        <Menu.Divider />
        <Menu.Item key="2">
            <span> Settings </span>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="3">
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
        return (
            <Header className="header" style={{backgroundColor: "#17293c"}}>
                <Row>
                    <NavLink to="/">

                        <Col span={4}>
                            <div className="gitfunded-logo" />
                        </Col>

                        {/*<Col span={2}>*/}
                            {/*<span style={{color: '#bea6c6', fontSize: 20}}> SyndLend </span>*/}
                        {/*</Col>*/}
                    </NavLink>
                    <Col span={20}>
                        <Dropdown
                            overlay={this.menu}
                        >
                            <a style={{float: "right"}} className="ant-dropdown-link" href="#">
                                <Avatar shape="square" icon="user" src={this.context.avatar_url}/>
                            </a>
                        </Dropdown>
                        <Menu theme="dark" mode="horizontal" style={{ lineHeight: "64px", backgroundColor: "#17293c"}} />
                    </Col>
                </Row>
            </Header>
        )
}
};

export default Menubar;
Menubar.contextType=UserContext;
