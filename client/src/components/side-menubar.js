import React from 'react';
import { NavLink } from 'react-router-dom';
import { Layout, Menu, Icon } from "antd";

const { Sider } = Layout;

const SideMenuBar = (props) => {
    return (
        <Sider width={200} collapsible collapsed={props.collapsed}>
            <Menu theme="dark" mode="inline" defaultSelectedKeys={["0"]} className="main-menu">
                <Menu.Item key="0">
                    <NavLink to="/">
                        <Icon type="dashboard"/>
                        <span>
                            Dashboard
                        </span>
                    </NavLink>
                </Menu.Item>

                <Menu.Item key="1">
                    <NavLink to="/profile">

                        <Icon type="user"/>
                        <span>
                            Profile
                        </span>
                    </NavLink>
                </Menu.Item>
            </Menu>
        </Sider>
    );
};

export default SideMenuBar;
