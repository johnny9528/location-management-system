import React, { Component } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { Layout } from "antd";
import storageUtils from '../../utils/storageUtils'
import LeftNav from "../../components/left-nav";
import Header from "../../components/header";
// import Home from '../home/home'
import Home from "../home/home_copy";
import Anchor from "../anchor/anchor";
import Tag from "../tag/tag";
import User from "../user/user";
import NotFound from "../not-found/not-found";
import Test from "../test/test"

const { Footer, Sider, Content } = Layout;

/*
后台管理的路由组件
 */
export default class Admin extends Component {
  render() {
    const user = storageUtils.getUser()

    if(Object.keys(user).length === 0) {
      console.log("redirect");
      return <Redirect to='/login'/>
    }

    return (
      <Layout style={{ minHeight: "100%" }}>
        <Header>Header</Header>

        <Layout>
          {user.level === "admin" ? (
            <Sider
              style={{
                // height: "100vh-80px",
                backgroundColor: "#fff"
              }}
            >
              <LeftNav />
            </Sider>
          ) : null}
          <Layout>
            <Content style={{ margin: 20, backgroundColor: "#fff" }}>
              <Switch>
                <Redirect from="/" exact to="/home" />
                <Route path="/home" component={Home} />
                <Route path="/anchor" component={Anchor} />
                <Route path="/tag" component={Tag} />
                <Route path="/user" component={User} />
                <Route path="/test" component={Test} />
                <Route component={NotFound} />
              </Switch>
            </Content>
            <Footer style={{ textAlign: "center", color: "green" }}>
              @copyright 2020智能计算与通信实验室
            </Footer>
          </Layout>
        </Layout>
      </Layout>
    );
  }
}