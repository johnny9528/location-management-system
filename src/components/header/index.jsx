import React, {Component} from 'react'
import {withRouter, Link} from 'react-router-dom'
import { Modal, Icon, Dropdown, Menu, Avatar, message } from 'antd'
import { connect } from 'react-redux'

import LinkButton from '../link-button'
import { reqUserUpdatePassword } from '../../api'
import menuList from '../../config/menuConfig'
import {formateDate} from '../../utils/dateUtils'
import storageUtils from '../../utils/storageUtils'
import UpdatePasswordForm from './update-password-form'
import './index.less'
import logo from '../../assets/images/logo.png'
import defaultAva from '../../assets/images/default.png'
import { logout } from '../../redux/actions'


// const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

/*
header的组件
 */
class Header extends Component {

  state = {
    currentTime: formateDate(Date.now()), // 当前时间字符串
    dayPictureUrl: '', // 天气图片url
    weather: '', // 天气的文本
    passwordVisible: false, // 控制修改密码model显示
    confirmPasswordLoading: false, // 修改面model loading控制
  }

  getTime = () => {
    // 每隔1s获取当前时间, 并更新状态数据currentTime
    this.intervalId = setInterval(() => {
      const currentTime = formateDate(Date.now())
      this.setState({currentTime})
    }, 1000)
  }

  getTitle = () => {
    // 得到当前请求路径
    const path = this.props.location.pathname
    let title
    menuList.forEach(item => {
      if (item.key===path) { // 如果当前item对象的key与path一样,item的title就是需要显示的title
        title = item.title
      } else if (item.children) {
        // 在所有子item中查找匹配的
        const cItem = item.children.find(cItem => path.indexOf(cItem.key)===0)
        // 如果有值才说明有匹配的
        if(cItem) {
          // 取出它的title
          title = cItem.title
        }
      }
    })
    return title
  }

  /*
  退出登陆
   */
  logout = () => {
    // 显示确认框
    Modal.confirm({
      content: '确定退出吗?',
      onOk: () => {
        console.log('OK', this)
        // 从store中删除保存的user数据
        this.props.logout()

        // 跳转到login
        this.props.history.replace('/login')
      }
    })
  }

  handleCancel = () => {
    // // 清除输入数据
    this.form.resetFields();
    // // 隐藏确认框
    this.setState({
      passwordVisible: false
    });
  };

  updatePassword = () =>{
    this.form.validateFields(async (err, values) => {
      if(!err) {
        this.setState({confirmPasswordLoading: true})
        const {oldPassword, newPassword} = values
        // const { username } = storageUtils.getUser()
        const { username } = this.props.user
        let result = await reqUserUpdatePassword(username, oldPassword, newPassword)

        if (result.code === 200) {
          // 隐藏确定框
          this.setState({ passwordVisible: true })
          // 清除输入数据
          this.form.resetFields()
          message.success("修改成功");
        }
        else {
          message.error("修改失败" + result.message)
        }
        this.setState({confirmPasswordLoading: false})
      }
    })
  }


  /*
  第一次render()之后执行一次
  一般在此执行异步操作: 发ajax请求/启动定时器
   */
  componentDidMount () {
    // 获取当前的时间
    this.getTime()
  }
  /*
  // 不能这么做: 不会更新显示
  componentWillMount () {
    this.title = this.getTitle()
  }*/

  /*
  当前组件卸载之前调用
   */
  componentWillUnmount () {
    // 清除定时器
    clearInterval(this.intervalId)
  }


  render() {

    const { passwordVisible, confirmPasswordLoading} = this.state

    // const {username, level} = storageUtils.getUser()
    const {username, level} = this.props.user
    // console.log("username",username,level);

    const menu = (
      <Menu selectable={false}>
          <MenuItemGroup title="用户中心">
            {/* <Menu.Item key={1} onClick={() => this.toggleInfoVisible(true)}><Icon type="user" />编辑个人信息</Menu.Item> */}
            { level ==="user" ?
              (
                <Menu.Item key={1}
                  onClick={() => this.setState({passwordVisible: true})}
                >
                  <Icon type="edit"/>
                    修改密码
                  </Menu.Item>
              ) : null
            }
            <Menu.Item key={2} onClick={this.logout}><Icon type="logout" />退出登录</Menu.Item>
          </MenuItemGroup>
          {/* <MenuItemGroup title="设置中心"> */}
            {/* <Menu.Item key={3} onClick={this.toggleFullscreen}><Icon type={isFullscreen ? 'fullscreen-exit' : 'fullscreen'} />切换全屏</Menu.Item> */}
            {/* <Menu.Item key={4} onClick={this.resetColor}><Icon type="ant-design" />恢复默认主题</Menu.Item> */}
          {/* </MenuItemGroup> */}
      </Menu>
    );

    return (
      <div className="header">
        <div className="header-left">
          <Link to="/" className="left-nav-header">
            <img src={logo} alt="logo" />
            <h1>定位管理系统</h1>
          </Link>
        </div>
        <div className="header-middle">
          {/* <span>{currentTime}</span> */}
          {/* <img src={dayPictureUrl} alt="weather" /> */}
          {/* <span>{weather}</span> */}
        </div>
        <div className="header-right">
          <Dropdown overlay={menu} placement="bottomCenter">
            <LinkButton>
              <Avatar size='small' src={defaultAva}></Avatar>
              &nbsp;
              <span>{username}</span>
            </LinkButton>
          </Dropdown>
        </div>
        <Modal
          title="修改密码"
          visible={passwordVisible}
          onOk={this.updatePassword}
          onCancel={this.handleCancel}
          confirmLoading={confirmPasswordLoading}
        >
          <UpdatePasswordForm
            username={username}
            setForm={(form) => {this.form = form}}
          />
        </Modal>
      </div>
    );
  }
}

export default connect(
  state => ({user: state.user}),
  {logout}
)(withRouter(Header))