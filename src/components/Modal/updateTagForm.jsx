import React from 'react'
import { Form, Input } from 'antd'
const Item = Form.Item

const UpdateTagForm = (props) => {

  const { getFieldDecorator } = props.form;
  const tag = props.tag;
  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 15 },
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
        <Item label='所属用户'>
          <Input defaultValue={tag.user.username} disabled/>
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

export default UpdateTagForm;