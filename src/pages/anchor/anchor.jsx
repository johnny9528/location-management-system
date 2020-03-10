import React from 'react';
import { Redirect} from "react-router-dom";
import storageUtils from '../../utils/storageUtils'
import { message } from 'antd'
class Anchor extends React.Component {

    render() {
        const user = storageUtils.getUser()
        if(user.level !== "admin") {
          message.warn("无权访问")
          return <Redirect to='/login'/>
        }

        return (
            <div>anchor管理界面</div>
        )
    }
}

export default Anchor;