import React, {Component} from 'react'
import { Form, message, Modal } from 'antd'
import { connect } from 'react-redux'

import AddTagForm from '../../components/Modal/addTagForm'
import { reqAddTag } from '../../api'
import { getTags } from '../../redux/actions'

// const Item = Form.Item

class AddForm extends Component {

  state = {
    confirmLoading: false,
  }

  addTag = () => {
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        this.setState({confirmLoading: true})

        // 收集数据, 并提交添加分类的请求
        const {tId, username, description} = values
				const result = await reqAddTag(tId, username, description)
        if(result.code===200) {
          // 清除输入数据
          this.props.form.resetFields()
          // 隐藏add modal
          this.props.setShowModal('')
          // redux
          this.props.getTags(this.props.user.level)
          message.success("添加成功");
				}
				else {
					message.error("添加失败" + result.message)
        }
        this.setState({confirmLoading: false})
      }
    })
  }

  handleCancel = () => {
    this.props.form.resetFields()
    this.props.setShowModal('')
  }

  render() {
    const { showModal } = this.props;
    const { confirmLoading } = this.state;
    return (
        <Modal
            title="添加tag"
            visible={showModal === 'add'}
            onOk={this.addTag}
            onCancel={this.handleCancel}
            confirmLoading={confirmLoading}
        >
          <AddTagForm
            form={this.props.form}
          />
      </Modal>
    )
  }
}

export default connect(
  state => ({user: state.user}),
  {getTags}
)(Form.create()(AddForm))