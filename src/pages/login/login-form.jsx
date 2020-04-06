import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Form, Icon, Input, Radio, Row, Col, message, Button } from 'antd'
import LinkButton from '../../components/link-button'
import storageUtils from '../../utils/storageUtils'
import { reqAdminLogin, reqUserLogin} from '../../api'

const randomNum = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
}

class LoginForm extends Component {
  state = {
    radio: "user", //用户、管理员登录
    code: "", //验证码
    focusItem: -1, // Input聚焦项
    loading: false, //登录button加载状态
  };

  toggle = (option) => {
    this.props.form.resetFields();
    this.props.toggleShow(option);
    this._createCode();
  };

  handleRadio = (e) => {
    // console.log("the radio is " + e.target.value);
    this.setState({
      radio: e.target.value
    });
  };

  handleSubmit = (event) => {

    this._createCode();
    // 阻止事件的默认行为
    event.preventDefault();

    // 对所有表单字段进行检验
    this.props.form.validateFields(async (err, values) => {
      // 检验成功
      if (!err) {
        this.setState({loading: true});

        // console.log('提交登陆的ajax请求', values)
        // 请求登陆
        const { username, password } = values;

        // radio = admin, 管理员登陆
        if (this.state.radio === "admin") {
          const result = await reqAdminLogin(username, password); // {status: 0, data: user}  {status: 1, msg: 'xxx'}
          console.log("请求成功", result);
          if (result.code === 200) {
            // 登陆成功
            // 提示登陆成功
            message.success("登陆成功");

            // 保存user
            const user = {
              username: result.username,
              token: result.token,
              level: "admin",
              id: result.id
            };
            console.log(result.token);
            // token = result.token; // 保存在内存中
            storageUtils.saveUser(user); // 保存到local中

            // 跳转到管理界面 (不需要再回退回到登陆)
            this.props.history.replace("/");
          } else {
            // 登陆失败
            // 提示错误信息
            console.log("管理员登陆失败,用户名或者密码错误");
            message.error("用户名或者密码错误");
            this.changeCaptcha();
            this.setState({loading: false});
          }
        } else if (this.state.radio === "user") {
          // 用户登陆
          const result = await reqUserLogin(username, password);
          if (result.code === 200) {
            // 登陆成功
            // 提示登陆成功
            message.success("用户登陆成功");

            // 保存user
            const user = {
              username: result.username,
              token: result.token,
              level: "user",
              id: result.id
            };
            // token = result.token; // 保存在内存中
            storageUtils.saveUser(user); // 保存到local中

            // 跳转到管理界面 (不需要再回退回到登陆)
            this.props.history.replace("/");
          } else {
            // 登陆失败
            // 提示错误信息
            console.log("用户登陆失败,用户名或者密码错误");
            message.error("用户名或者密码错误");
            this.changeCaptcha();
            this.setState({loading: false});
          }
        }
      } else {
        console.log("检验失败!");
      }
    });
  };

  /* 生成验证码 */
  _createCode = () => {
    const ctx = this.canvas.getContext("2d");
    const chars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    let code = ''
    ctx.clearRect(0, 0, 80, 40);
    for (let i = 0; i < 4; i++) {
      const char = chars[randomNum(0, 57)];
      code += char;
      ctx.font = randomNum(20, 25) + "px SimHei"; //设置字体随机大小
      ctx.fillStyle = "#D3D7F7";
      ctx.textBaseline = "middle";
      ctx.shadowOffsetX = randomNum(-3, 3);
      ctx.shadowOffsetY = randomNum(-3, 3);
      ctx.shadowBlur = randomNum(-3, 3);
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      let x = (80 / 5) * (i + 1);
      let y = 40 / 2;
      let deg = randomNum(-25, 25);
      /**设置旋转角度和坐标原点**/
      ctx.translate(x, y);
      ctx.rotate((deg * Math.PI) / 180);
      ctx.fillText(char, 0, 0);
      /**恢复旋转角度和坐标原点**/
      ctx.rotate((-deg * Math.PI) / 180);
      ctx.translate(-x, -y);
    }
    this.setState({
      code
    });
  };
  /* 点击改变验证码 */
  changeCaptcha = () => {
    console.log("captcha");
    this.props.form.resetFields(["captcha"]);
    this._createCode();
  };

  componentDidMount() {
    this._createCode();
  }

  render() {
    const { code, focusItem, radio, loading } = this.state;
    const form = this.props.form;
    const { getFieldDecorator } = form;
    const show = this.props.show;

    return (
      <div>
        <h2 className="title">{radio === "user" ? "用户登陆" : "管理员登录"}</h2>
        <Form hideRequiredMark>
          <Form.Item>
            {getFieldDecorator("username", {
              validateFirst: true,
              rules: [
                { required: true, whitespace: true, message: "用户名必须输入" },
                { min: 4, message: "用户名至少4位" },
                { max: 12, message: "用户名最多12位" },
                { pattern: /^[a-zA-Z0-9_]+$/, message: "用户名必须是英文、数字或下划线组成" }
              ]
              // initialValue: "admin" // 初始值
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
                allowClear
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator("password", {
              validateFirst: true,
              rules: [
                { required: true, whitespace: true, message: "密码必须输入" },
                // { min: 4, message: "密码至少4位" },
                { max: 12, message: "密码最多12位" },
                { pattern: /^[a-zA-Z0-9_]+$/, message: "密码必须是英文、数字或下划线组成" }
              ]
            })(
              <Input
                onFocus={() => this.setState({ focusItem: 1 })}
                onBlur={() => this.setState({ focusItem: -1 })}
                onPressEnter={this.handleSubmit}
                prefix={
                  <Icon
                    type="lock"
                    style={{
                      color: focusItem === 1 ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.4)"
                    }}
                  />
                }
                type="password"
                placeholder="密码"
                size={focusItem === 1 ? "large" : "default"}
                allowClear
              />
            )}
          </Form.Item>
          <Form.Item>
            <Row gutter={8}>
              <Col span={15}>
                {getFieldDecorator("captcha", {
                  validateFirst: true,
                  rules: [
                    { required: true, whitespace: true, message: "验证码必须输入" },
                    {
                      validator: (rule, value, callback) => {
                        console.log("validate code: "+code);
                        if (code.toUpperCase() !== value.toUpperCase()) {
                          callback("验证码错误");
                        }
                        callback();
                      }
                    }
                  ]
                })(
                  <Input
                    className="myInput"
                    prefix={
                      <Icon
                        type="safety"
                        style={{
                          color: focusItem === 2 ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.4)",
                        }}
                      />
                    }
                    onFocus={() => this.setState({ focusItem: 2 })}
                    onBlur={() => this.setState({ focusItem: -1 })}
                    onPressEnter={this.handleSubmit}
                    placeholder="验证码"
                    size={focusItem === 2 ? "large" : "default"}
                    allowClear
                  />
                )}
              </Col>
              <Col span={9}>
                {show === "login" ? (
                  <canvas
                    onClick={this.changeCaptcha}
                    width="80"
                    height="40"
                    ref={(el) => {
                      this.canvas = el;
                    }}
                  />
                ) : (
                  <canvas
                    onClick={this.changeCaptcha}
                    width="80"
                    height="40"
                    ref={(el) => {
                      this.canvas = el;
                    }}
                  />
                )}
              </Col>
            </Row>
          </Form.Item>
          <Form.Item>
            <Radio.Group onChange={this.handleRadio} value={this.state.radio}>
              <Radio value={"user"}>用户登陆</Radio>
              <Radio value={"admin"}>管理员登陆</Radio>
              {/* <Radio value={3}>用户注册</Radio> */}
            </Radio.Group>
          </Form.Item>
          <Form.Item>
            <Button
              onClick={this.handleSubmit}
              loading={loading}
            >
              {loading? "登录中" : "登录"}
            </Button>
            <div className="after-button">
              <LinkButton onClick={() => this.toggle("getBackPassword")}>忘记密码</LinkButton>
              <LinkButton onClick={() => this.toggle("register")}>注册</LinkButton>
            </div>
          </Form.Item>
        </Form>
      </div>
    );
  }
}


export default withRouter(Form.create()(LoginForm))