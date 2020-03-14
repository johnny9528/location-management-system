import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {
  Form,
  Input,
  Icon
} from 'antd'

const Item = Form.Item

/*
更新分类的form组件
 */
class UpdateForm extends Component {

  static propTypes = {
    tag: PropTypes.string.isRequired,
    setForm: PropTypes.func.isRequired
  }

  componentWillMount () {
    // 将form对象通过setForm()传递父组件
    this.props.setForm(this.props.form)
  }

  render() {

    const { username } = this.props
    const { getFieldDecorator, getFieldValue } = this.props.form

    const formItemLayout = {
      labelCol: { span: 4 },  // 左侧label的宽度
      wrapperCol: { span: 15 }, // 右侧包裹的宽度
    }

    return (
      <Form {...formItemLayout}>
        <Item label='用户名'>
          <Input defaultValue={username} disabled/>
        </Item>
        <Item label='旧密码'>
          {getFieldDecorator("oldPassword", {
            validateFirst: true,
            rules: [
              { required: true, whitespace: true, message: "密码必须输入" },
              { min: 4, message: "密码至少4位" },
              { max: 12, message: "密码最多12位" },
              { pattern: /^[a-zA-Z0-9_]+$/, message: "密码必须是英文、数字或下划线组成" }
            ]
          })(
            <Input
              placeholder="请输入旧密码"
              type="password"
              allowClear
            />
          )}
        </Item>
        <Item label='新密码'>
          {getFieldDecorator("newPassword", {
            validateFirst: true,
            rules: [
              { required: true, whitespace: true, message: "密码必须输入" },
              { min: 4, message: "密码至少4位" },
              { max: 12, message: "密码最多12位" },
              { pattern: /^[a-zA-Z0-9_]+$/, message: "密码必须是英文、数字或下划线组成" }
            ]
          })(
            <Input
              placeholder="请输入新密码"
              type="password"
              allowClear
            />
          )}
        </Item>
        <Item label='确认密码'>
          {getFieldDecorator("confirmPassword", {
            rules: [
              { required: true, message: '请确认密码' },
              {
                  validator: (rule, value, callback) => {
                      if (value && value !== getFieldValue('newPassword')) {
                          callback('两次输入不一致！')
                      }
                      callback()
                  }
              },
            ]
          })(
            <Input
              placeholder="请确认密码"
              type="password"
              allowClear
            />
          )}
        </Item>
      </Form>
    )
  }
}

export default Form.create()(UpdateForm)