import React from 'react';
import {
    Form
  } from 'antd'
 class Register extends React.Component {

    render() {
        return(
            <div>注册界面</div>
        )
    }
 }


const WrapRregister = Form.create()(Register)
export default WrapRregister