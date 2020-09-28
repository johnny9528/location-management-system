import React from 'react'
import { Form, Input, Tooltip, Icon } from 'antd'
import { connect } from 'react-redux'
const Item = Form.Item

/**
 * 通用添加tag自定义组件
 */
const AddTagForm = (props) => {

  const { getFieldDecorator } = props.form;

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
              { required: true, message: '编号必须输入' },
              {
                pattern: /^([0-5]\d{4}|6([0-4]\d{3}|5([0-4]\d{2}|5([0-2]\d|3[0-5]))))-([0-5]\d{4}|6([0-4]\d{3}|5([0-4]\d{2}|5([0-2]\d|3[0-5]))))$/,
                message: "格式不正确"
              }
            ]
          })(
            <Input
                placeholder='请输入tag编号'
                allowClear
                suffix={
                  <Tooltip title="格式XXXXX-XXXXX（X为数字），最大65535-65535">
                    <Icon type="info-circle" style={{ color: 'rgba(0,0,0,.45)' }} />
                  </Tooltip>
                }
              />
          )
        }
      </Item>
      { props.user.level === 'admin' ? (<Item label='用户名'>
        {
          getFieldDecorator('username', {
            initialValue: '',
            rules: [
              { required: true, whitespace: true, message: "用户名必须输入" },
              { min: 4, message: "用户名至少4位" },
              { max: 12, message: "用户名最多12位" },
              { pattern: /^[a-zA-Z0-9_]+$/, message: "用户名必须是英文、数字或下划线组成" }
            ]
          })(
            <Input placeholder='请输入所属用户' allowClear/>
          )
        }
      </Item>) : null }
      <Item label='描述'>
        {
          getFieldDecorator('description', {
            initialValue: '',
          })(
            <Input placeholder='请输入描述' allowClear />
          )
        }
      </Item>
    </Form>
  )
}

export default connect(
  state => ({user: state.user})
)(AddTagForm);