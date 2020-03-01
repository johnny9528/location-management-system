import React, {Component} from 'react'
import {BrowserRouter, Route, Switch} from 'react-router-dom'

import Login from './pages/login/login'
import Register from './pages/register/register'
import Admin from './pages/admin/admin'
import memoryUtils from './utils/memoryUtils'
/*
应用的根组件
 */
export default class App extends Component {


  render () {
    console.log("the memory is ......" + memoryUtils.login_type);
    return (
      <BrowserRouter>
        <Switch> {/*只匹配其中一个*/}
          <Route path='/login' component={Login}></Route>
          <Route path='/register' component={Register}></Route>
          <Route path='/' component={Admin}></Route>
        </Switch>
      </BrowserRouter>
    )
  }
}