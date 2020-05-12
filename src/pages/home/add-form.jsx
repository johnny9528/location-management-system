import React, {Component} from 'react'
import { reqAddTag, reqUserAddTag } from '../../api'
import { Form, Modal,  message } from 'antd'
import AddTagForm from '../../components/Modal/addTagForm'

class AddForm extends Component {

  state = {
    confirmLoading: false,
  }

  addTag = () => {
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        this.setState({confirmLoading: true})

        // 收集数据, 并提交添加分类的请求
        const {tId, username, description} = values;
        const level = this.props.user.level;
        let result;
        if (level === 'admin') {
          result = await reqAddTag(tId, username, description)
        } else {
          result = await reqUserAddTag(tId, description)
        }
        if(result.code===200) {
          this.props.form.resetFields()
          // 隐藏add modal
          this.props.setShowModal('')
          this.props.getTags()
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
    const { showModal, user } = this.props;
    const { confirmLoading } = this.state;

    return (
        <Modal
            title="添加tag"
            visible={showModal==='add'}
            onOk={this.addTag}
            onCancel={this.handleCancel}
            confirmLoading={confirmLoading}
        >
          <AddTagForm
            form={this.props.form}
            level={user.level}
          />
      </Modal>
    )
  }
}

export default Form.create()(AddForm)