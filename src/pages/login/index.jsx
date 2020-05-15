import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'

import { Form } from 'antd'
import logo from '../../assets/images/logo.png'
import './index.less'
import LoginForm from './login-form'
import RegisterForm from './register-form'
import storageUtils from '../../utils/storageUtils'

/*
登陆的路由组件
 */
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: 'login', //登录(login)、注册(register)、找回密码(getBackPassword)界面切换
    };
  }

  toggleShow = (option) => {
    this.setState({
        show: option
    })
  }

  render() {

    // 如果用户已经登陆, 自动跳转到管理界面
    const user = storageUtils.getUser()
    if(Object.keys(user).length !== 0) {
      return <Redirect to='/'/>
    }

    // 得到具强大功能的form对象
    const { show } = this.state

    return (
      <div className="background">
        <header className="login-header">
          <img src={logo} alt="logo" />
          <h1>定位管理系统</h1>
        </header>
        <div className="login">
          <div className={`box ${show === "login" ? "active" : ""}`}>
            <LoginForm toggleShow={this.toggleShow} show={show}/>
          </div>
          <div className={`box ${show === "register" || show === "getBackPassword" ? "active" : ""}`}>
            <RegisterForm toggleShow={this.toggleShow} show={show}/>
          </div>
        </div>
      </div>
    );
  }
}

const WrapLogin = Form.create()(Login)
export default WrapLogin