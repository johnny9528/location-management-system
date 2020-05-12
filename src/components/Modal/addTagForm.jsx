import React from 'react'
import { Form, Input } from 'antd'
const Item = Form.Item

const AddTagForm = (props) => {

  const { getFieldDecorator } = props.form;
  const { level } = props;

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
              { max: 12, message: "编号最多12位" },
            ]
          })(
            <Input placeholder='请输入编号' allowClear />
          )
        }
      </Item>
      { level === 'admin' ? (<Item label='用户名'>
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

export default AddTagForm;