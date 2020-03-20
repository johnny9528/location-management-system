import React, { Component } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { Layout } from "antd";

// import memoryUtils from "../../utils/memoryUtils";
import storageUtils from '../../utils/storageUtils'
import LeftNav from "../../components/left-nav";
import Header from "../../components/header";
// import Home from '../home/home'
import Home from "../home/home_copy";
import Anchor from "../anchor/anchor";
import Tag from "../tag/tag";
import User from "../user/user";
import NotFound from "../not-found/not-found";
// import Category from "../category/category";
// import Product from "../product/product";
// import Role from "../role/role";
// import Bar from "../charts/bar";
// import Line from "../charts/line";
// import Pie from "../charts/pie";
// import Order from "../order/order";
// import Tag from '../location/tag';
// import location_user from '../location/user';

const { Footer, Sider, Content } = Layout;

/*
后台管理的路由组件
 */
export default class Admin extends Component {
  render() {
    const user = storageUtils.getUser()
    // console.log("user "+JSON.stringify(user), Object.keys(user).length);
    if(Object.keys(user).length === 0) {
      console.log("redirect");
      return <Redirect to='/login'/>
    }
    // const login_type = memoryUtils.login_type;
    // console.log("the login type in / is ....." + login_type);
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
            <Content style={{ height: "70%", margin: 20, backgroundColor: "#fff" }}>
              <Switch>
                <Redirect from="/" exact to="/home" />
                <Route path="/home" component={Home} />
                <Route path="/anchor" component={Anchor} />
                <Route path="/tag" component={Tag} />
                <Route path="/user" component={User} />
                {/* <Route path="/category" component={Category} />
                <Route path="/product" component={Product} />
                <Route path="/role" component={Role} />
                <Route path="/charts/bar" component={Bar} />
                <Route path="/charts/pie" component={Pie} />
                <Route path="/charts/line" component={Line} />
                <Route path="/order" component={Order} /> */}
                <Route component={NotFound} />
              </Switch>
            </Content>
            {/* <Footer style={{textAlign: 'center', color: '#cccccc'}}>@copyright icc智能计算与通信实验室</Footer> */}
            <Footer style={{ textAlign: "center", color: "green" }}>
              @copyright 2020智能计算与通信实验室
            </Footer>
          </Layout>
        </Layout>
      </Layout>
    );
  }
}