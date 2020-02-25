import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {
  Form,
  Select,
  Input
} from 'antd'

const Item = Form.Item
const Option = Select.Option

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
        <Item label='tag编号'>
          {
            getFieldDecorator('tId', {
              initialValue: '',
              rules: [
                {required: true, message: '编号必须输入'}
              ]
            })(
                <Input placeholder='请输入编号'/>
            )
          }
        </Item>
        <Item label='用户名'>
          {
            getFieldDecorator('username', {
              initialValue: '',
              rules: [
                {required: true, message: '用户名必须输入'}
              ]
            })(
              <Input placeholder='请输入所属用户'/>
            )
          }
        </Item>
        <Item label='描述'>
          {
            getFieldDecorator('description', {
              initialValue: '',
            })(
              <Input placeholder='请输入描述'/>
            )
          }
        </Item>
      </Form>
    )
  }
}

export default Form.create()(AddForm)