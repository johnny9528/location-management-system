import React from 'react'
import { Form, Input, Tooltip, Icon } from 'antd'
const Item = Form.Item


/**
 * 通用更新tag自定义组件
 */
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
                {required: true, message: '编号必须输入'},
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