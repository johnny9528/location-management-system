import React, { Component } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { Layout } from "antd";
import { connect } from 'react-redux'

// import storageUtils from '../../utils/storageUtils'
import LeftNav from "../../components/left-nav";
import Header from "../../components/header";
import Home from '../home/home'
import Anchor from "../anchor/anchor";
import Tag from "../tag/tag";
import User from "../user/user";
import NotFound from "../not-found/not-found";
import { getAnchors, getTags, getUsers, setAnchors, setTags, setUsers } from '../../redux/actions'

const { Sider, Content } = Layout;

/*
后台管理的路由组件
 */
class Admin extends Component {

  componentDidMount = () => {

    //用户和管理员都需要anchors和tags数据
    this.props.getAnchors(this.props.user.level); // 预加载数据

    //用户和管理员得到的tags数据不一样
    this.props.getTags(this.props.user.level);

    //只有管理员需要users数据
    if(this.props.user.level === 'admin') {
      this.props.getUsers();
    }
  }

  render() {
    // const user = storageUtils.getUser()
    const user = this.props.user
    if(Object.keys(user).length === 0) {
      console.log("redirect");
      return <Redirect to='/login'/>
    }
    return (
      <Layout style={{ minHeight: "100%" }}> {/* Content内容不够时依然保持100%高度 */}
        <Header>Header</Header>
        <Layout>
          {user.level === "admin" ? (
            <Sider
              style={{
                backgroundColor: "#fff"
              }}
              width="200"
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
                <Route component={NotFound} />
              </Switch>
            </Content>
            {/* <Footer style={{ height:20, textAlign: "center", color: "green" }}>
              @copyright 2020智能计算与通信实验室
            </Footer> */}
          </Layout>
        </Layout>
      </Layout>
    );
  }
}

export default connect(
  state => ({user: state.user}),
  {getAnchors, getTags, getUsers, setAnchors, setTags, setUsers}
)(Admin)