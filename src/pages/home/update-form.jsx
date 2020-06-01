import React, {Component} from 'react'
import { Form, Modal,  message } from 'antd'
import { connect } from 'react-redux'

import { reqUpdateTag, reqUserUpdateTag } from '../../api'
import UpdateTagForm from '../../components/Modal/updateTagForm'
import { getTags } from '../../redux/actions'

class UpdateForm extends Component {

  state = {
    confirmLoading: false,
  }

  updateTag = () => {
    // 进行表单验证, 只有通过了才处理
    this.props.form.validateFields(async (err, values) => {
      if(!err) {
        this.setState({confirmLoading: true})

        // 准备数据
        const id = this.props.tag._id
        const {tId, description} = values

        const level = this.props.user.level;
        let result;
        if (level === 'admin') {
          result = await reqUpdateTag(id, tId, description)
        } else {
          result = await reqUserUpdateTag(id, tId, description)
        }

        if (result.code === 200) {
          this.props.form.resetFields()
          // 隐藏modal
          this.props.setShowModal('')
          // redux
          this.props.getTags(this.props.user.level)
          message.success("修改成功");
        }
        else if (result.code === 11000) {
          message.error('修改失败：tId已存在')
        } else {
          message.error('修改失败' + result.message)
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
    const { showModal, tag } = this.props;
    const { confirmLoading } = this.state;
    return (
        <Modal
            title="更新tag"
            visible={showModal === 'update'}
            onOk={this.updateTag}
            onCancel={this.handleCancel}
            confirmLoading={confirmLoading}
        >
          <UpdateTagForm
            form={this.props.form}
            tag={tag}
          />
      </Modal>
    )
  }
}

export default connect(
  state => ({user: state.user}),
  {getTags}
)(Form.create()(UpdateForm))