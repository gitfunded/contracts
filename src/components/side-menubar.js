import React from 'react';
import { NavLink } from 'react-router-dom';
import { Layout, Menu, Icon } from "antd";

const { Sider } = Layout;

const SideMenuBar = () => {
    return (
        <Sider width={100} style={{ background: "#fff" }}>
            <Menu mode="inline" defaultSelectedKeys={["0"]} className="main-menu">
                <Menu.Item key="0">
                    <NavLink to="/">
                        <span>
                            <Icon type="dashboard" />

                        </span>
                    </NavLink>
                </Menu.Item>

                <Menu.Item key="1">
                    <NavLink to="/profile">
                        <span>
                            <Icon type="user" />

                        </span>
                    </NavLink>
                </Menu.Item>
            </Menu>
        </Sider>
    );
};

export default SideMenuBar;
