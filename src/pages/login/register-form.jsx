import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Form, Icon, Input, message, Button } from 'antd'
import LinkButton from '../../components/link-button'
// import memoryUtils from '../../utils/memoryUtils'
// import storageUtils from '../../utils/storageUtils'
import { reqUserRegister, reqUserGetBackPassword, reqCheckName } from '../../api'
import debounce from '../../utils/debounce'

class RegisterForm extends Component {
  state = {
    focusItem: -1,
    loading: false, //登录button加载状态
  };

  toggle = (option) => {
    this.props.form.resetFields()
    this.props.toggleShow(option)
  }

  handleSubmit = (event) => {

    const show = this.props.show;
    // 阻止事件的默认行为
    event.preventDefault()

    // 对所有表单字段进行检验
    this.props.form.validateFields(async (err, values) => {
      // 检验成功
      if (!err) {
        this.setState({loading: true});

        // console.log('提交登陆的ajax请求', values)
        // 请求登陆
        const { LoginUsername, LoginEmail, LoginPassword } = values;
        console.log(LoginUsername, LoginEmail, LoginPassword);

        //登录
        if (show === "register") {
          const result = await reqUserRegister(LoginUsername, LoginEmail, LoginPassword);
          console.log("user注册请求成功", result);
          if (result.code === 200) {
            message.success("用户注册成功");
            this.setState({loading: false});
            this.toggle("login");
          } else {
            message.error("注册失败: "+ result.message);
            this.setState({loading: false});
          }
        //找回密码
        } else if (show === "getBackPassword") {
          const result = await reqUserGetBackPassword(LoginUsername, LoginEmail, LoginPassword);
          console.log("user找回密码", result);
          if (result.code === 200) {
            message.success("密码成功找回");
            this.setState({loading: false});
            this.toggle("login");
          } else {
            message.error("找回密码失败: "+ result.message);
            this.setState({loading: false});
          }
        }
      } else {
        console.log("检验失败!");
      }
    });

    // 得到form对象
    // const form = this.props.form
    // // 获取表单项的输入数据
    // const values = form.getFieldsValue()
    // console.log('handleSubmit()', values)
  }

  checkName = debounce(async (value) => {
    if (value) {
      const res = await reqCheckName(value);
      if (res.isExisted) {
        this.props.form.setFields({
          LoginUsername: {
            value,
            errors: [new Error("用户名已存在")]
          }
        });
      }
    }
  });

  render() {
    const { focusItem, loading } = this.state
    const form = this.props.form
    const { getFieldDecorator, getFieldValue } = form;
    const show = this.props.show;

    return (
      <div>
        <h2 className="title">{show === "register" ? "用户注册" : "找回密码"}</h2>
        <Form
          hideRequiredMark
        >
          <Form.Item>
            {getFieldDecorator("LoginUsername", {
              validateFirst: true,
              rules: [
                { required: true, message: "用户名必须输入" },
                { min: 4, message: "用户名至少4位" },
                { max: 12, message: "用户名最多12位" },
                { pattern: /^[a-zA-Z0-9_]+$/, message: "用户名必须是英文、数字或下划线组成" }
              ]
            })(
              <Input
                onFocus={() => this.setState({ focusItem: 0 })}
                onBlur={() => this.setState({ focusItem: -1 })}
                onPressEnter={this.handleSubmit}
                prefix={
                  <Icon
                    type="user"
                    style={{
                      color: focusItem === 0 ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.4)"
                    }}
                  />
                }
                placeholder="用户名"
                size={focusItem === 0 ? "large" : "default"}
                onChange={(e) => show ==="register" ? this.checkName(e.target.value) : null}
                allowClear
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator("LoginEmail", {
              validateFirst: true,
                rules: [
                  { required: true, message: "邮箱必须输入" },
                  { pattern: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/, message: '邮箱格式不正确' },
                ]
              })(
                <Input
                  onFocus={() => this.setState({ focusItem: 1 })}
                  onBlur={() => this.setState({ focusItem: -1 })}
                  onPressEnter={this.handleSubmit}
                  prefix={
                    <Icon
                      type="mail"
                      style={{
                        color: focusItem === 1 ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.4)"
                      }}
                    />
                  }
                  placeholder="邮箱"
                  size={focusItem === 1 ? "large" : "default"}
                  allowClear
                />
              )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator("LoginPassword", {
              validateFirst: true,
              rules: [
                { required: true, whitespace: true, message: "密码必须输入" },
                { min: 4, message: "密码至少4位" },
                { max: 12, message: "密码最多12位" },
                { pattern: /^[a-zA-Z0-9_]+$/, message: "密码必须是英文、数字或下划线组成" }
              ]
            })(
              <Input
                onFocus={() => this.setState({ focusItem: 2 })}
                onBlur={() => this.setState({ focusItem: -1 })}
                onPressEnter={this.handleSubmit}
                prefix={
                  <Icon
                    type="lock"
                    style={{
                      color: focusItem === 2 ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.4)"
                    }}
                  />
                }
                type="password"
                placeholder={show === "register" ? "密码" : "新密码"}
                size={focusItem === 2 ? "large" : "default"}
                allowClear
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator("confirmPassword", {
              // validateFirst: true,
              rules: [
                { required: true, message: '请确认密码' },
                {
                    validator: (rule, value, callback) => {
                        if (value && value !== getFieldValue('LoginPassword')) {
                            callback('两次输入不一致！')
                        }
                        callback()
                    }
                },
              ]
            })(
              <Input
                onFocus={() => this.setState({ focusItem: 3 })}
                onBlur={() => this.setState({ focusItem: -1 })}
                onPressEnter={this.handleSubmit}
                prefix={
                  <Icon
                    type="lock"
                    style={{
                      color: focusItem === 3 ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.4)"
                    }}
                  />
                }
                type="password"
                placeholder="确认密码"
                size={focusItem === 3 ? "large" : "default"}
                allowClear
              />
            )}
          </Form.Item>
          <Form.Item
            style={{ marginTop: 10 }}
          >
            {/* <div className="login-button" onClick={this.handleSubmit}>
              {show === "register" ? "注册" : "确认"}
            </div> */}
            <Button
              onClick={this.handleSubmit}
              loading={loading}
            >
              {show === "register" ? "注册" : "确认"}
            </Button>
            <div className="after-button">
              <LinkButton onClick={() => this.toggle('login')}>返回登录</LinkButton>
            </div>
          </Form.Item>
        </Form>
      </div>
    );
  }
}


export default withRouter(Form.create()(RegisterForm))