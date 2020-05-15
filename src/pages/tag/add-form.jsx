import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { Form } from 'antd'
import AddTagForm from '../../components/Modal/addTagForm'

// const Item = Form.Item

class AddForm extends Component {

  static propTypes = {
    setForm: PropTypes.func.isRequired, // 用来传递form对象的函数
  }

  componentWillMount () {
    this.props.setForm(this.props.form)
  }

  render() {
    return (
      <AddTagForm
        form={this.props.form}
        level={this.props.level}
      />
    )
  }
}

export default Form.create()(AddForm)