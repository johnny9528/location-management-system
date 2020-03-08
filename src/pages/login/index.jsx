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
/*
1. 高阶函数
    1). 一类特别的函数
        a. 接受函数类型的参数
        b. 返回值是函数
    2). 常见
        a. 定时器: setTimeout()/setInterval()
        b. Promise: Promise(() => {}) then(value => {}, reason => {})
        c. 数组遍历相关的方法: forEach()/filter()/map()/reduce()/find()/findIndex()
        d. 函数对象的bind()
        e. Form.create()() / getFieldDecorator()()
    3). 高阶函数更新动态, 更加具有扩展性

2. 高阶组件
    1). 本质就是一个函数
    2). 接收一个组件(被包装组件), 返回一个新的组件(包装组件), 包装组件会向被包装组件传入特定属性
    3). 作用: 扩展组件的功能
    4). 高阶组件也是高阶函数: 接收一个组件函数, 返回是一个新的组件函数
 */
/*
包装Form组件生成一个新的组件: Form(Login)
新组件会向Form组件传递一个强大的对象属性: form
*/
/*
1. 前台表单验证
2. 收集表单输入数据
 */

/*
async和await
1. 作用?
   简化promise对象的使用: 不用再使用then()来指定成功/失败的回调函数
   以同步编码(没有回调函数了)方式实现异步流程
2. 哪里写await?
    在返回promise的表达式左侧写await: 不想要promise, 想要promise异步执行的成功的value数据
3. 哪里写async?
    await所在函数(最近的)定义的左侧写async
 */