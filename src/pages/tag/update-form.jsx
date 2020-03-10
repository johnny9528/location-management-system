import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {
  Form,
  Input
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

    const { tag } = this.props
    // console.log(tag)
    const { getFieldDecorator } = this.props.form

    const formItemLayout = {
      labelCol: { span: 4 },  // 左侧label的宽度
      wrapperCol: { span: 15 }, // 右侧包裹的宽度
    }

    return (
      <Form {...formItemLayout}>
        <Item label='tag编号'>
          {
            getFieldDecorator('tId', {
              initialValue: tag.tId,
              rules: [
                {required: true, message: '编号必须输入'}
              ]
            })(
                <Input placeholder='请输入tag编号' allowClear/>
            )
          }
        </Item>
        <Item label='用户名'>
          {
            getFieldDecorator('username', {
              initialValue: tag.user.username,
              rules: [
                {required: true, message: '用户名必须输入'}
              ]
            })(
              <Input placeholder='请输入所属用户' allowClear/>
            )
          }
        </Item>
        <Item label='描述'>
          {
            getFieldDecorator('description', {
              initialValue: tag.description,
            })(
              <Input placeholder='请输入描述' allowClear/>
            )
          }
        </Item>
      </Form>
    )
  }
}

export default Form.create()(UpdateForm)