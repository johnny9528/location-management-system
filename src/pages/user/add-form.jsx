import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {
  Form,
  // Select,
  Input,
  Icon
} from 'antd'

const Item = Form.Item
// const Option = Select.Option

/*
添加分类的form组件
 */
class AddForm extends Component {

  static propTypes = {
    setForm: PropTypes.func.isRequired, // 用来传递form对象的函数
  }

  componentWillMount () {
    this.props.setForm(this.props.form)
  }

  render() {
    const { getFieldDecorator } = this.props.form

    const formItemLayout = {
      labelCol: { span: 4 },  // 左侧label的宽度
      wrapperCol: { span: 15 }, // 右侧包裹的宽度
    }
    return (
      <Form {...formItemLayout}>
        <Item label='用户名'>
          {
            getFieldDecorator('username', {
              initialValue: '',
              rules: [
                { required: true, whitespace: true, message: '用户名必须输入' },
                { min: 4, message: '用户名至少4位' },
                { max: 12, message: '用户名最多12位' },
                { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名必须是英文、数字或下划线组成' },
              ]
            })(
              <Input
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="请输入用户名"
            />
            )
          }
        </Item>
        <Item label='密码'>
          {
            getFieldDecorator('password', {
              initialValue: '',
              rules: [
                { required: true, whitespace: true, message: '密码必须输入' },
                { min: 4, message: '密码至少4位' },
                { max: 12, message: '密码最多12位' },
                { pattern: /^[a-zA-Z0-9_]+$/, message: '密码必须是英文、数字或下划线组成' },
              ]
            })(
              <Input
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                type="password"
                placeholder="请输入密码"
              />
            )
          }
        </Item>
      </Form>
    )
  }
}

export default Form.create()(AddForm)