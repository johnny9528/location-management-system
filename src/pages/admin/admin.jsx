import React, {Component} from 'react'
import {Redirect, Route, Switch} from 'react-router-dom'
import { Layout } from 'antd'

import memoryUtils from '../../utils/memoryUtils'
import LeftNav from '../../components/left-nav'
import Header from '../../components/header'
// import Home from '../home/home'
import Home from '../home/home_copy'
import Category from '../category/category'
import Product from '../product/product'
import Role from '../role/role'
import User from '../user/user'
import Bar from '../charts/bar'
import Line from '../charts/line'
import Pie from '../charts/pie'
import NotFound from '../not-found/not-found'
import Order from '../order/order'

import Anchor from '../location/anchor';
// import Tag from '../location/tag';
import Tag from '../tag/tag';
// import location_user from '../location/user';


const { Footer, Sider, Content } = Layout

/*
后台管理的路由组件
 */
export default class Admin extends Component {
  render () {
    // const user = memoryUtils.user
    // 如果内存没有存储user ==> 当前没有登陆
    // if(!user || !user._id) {
    //   // 自动跳转到登陆(在render()中)
    //   return <Redirect to='/login'/>
    // }
    return (
      <Layout style={{minHeight: '100%'}}>
        <Sider>
          <LeftNav/>
        </Sider>
        <Layout>
          <Header>Header</Header>
          <Content style={{margin: 20, backgroundColor: '#fff'}}>
            <Switch>
              <Redirect from='/' exact to='/home'/>

              <Route path='/anchor' component={Anchor}/>
              <Route path='/tag' component={Tag}/>
              {/* <Route path='/location/user' component={location_user}/> */}
              <Route path='/user' component={User}/>

              <Route path='/home' component={Home}/>
              <Route path='/category' component={Category}/>
              <Route path='/product' component={Product}/>
              <Route path='/role' component={Role}/>
              <Route path="/charts/bar" component={Bar}/>
              <Route path="/charts/pie" component={Pie}/>
              <Route path="/charts/line" component={Line}/>
              <Route path="/order" component={Order}/>
              <Route component={NotFound}/>
            </Switch>
          </Content>
          {/* <Footer style={{textAlign: 'center', color: '#cccccc'}}>@copyright icc智能计算与通信实验室</Footer> */}
          <Footer style={{textAlign: 'center', color: 'green'}}>@copyright   2020智能计算与通信实验室</Footer>
        </Layout>
      </Layout>
    )
  }
}