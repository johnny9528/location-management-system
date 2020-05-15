/*
包含n个action creator函数的模块
同步action: 对象 {type: 'xxx', data: 数据值}
异步action: 函数  dispatch => {}
*/
import storageUtils from "../utils/storageUtils";
import * as api from "../api"
import { message } from 'antd'
import { wsUrl, wsRoute } from '../config/wsConfig'

export const RECEIVE_USER = 'get_user'  // 接收用户信息
export const RESET_USER = 'reset_user' // 重置用户信息

export const SET_ANCHORS = 'set_anchors' //设置anchors数据
export const SET_TAGS = 'set_tags' // 设置tags数据
export const SET_USERS = 'set_users' // 设置users数据

export const SET_WEBSOCKET = 'set_websocket'  //设置websocket对象
export const SET_TAGLOACTIONDATA = 'set_tagloactiondata' //设置tag定位数据对象


/*
设置用户的同步action
 */
export const setUser = (user) => ({type: RECEIVE_USER, user})

/*
退出登陆的同步action
 */
export const logout = () =>  {
  // 删除local中的user
  storageUtils.removeUser()
  // 返回action对象
  return {type: RESET_USER}
}

/*
设置anchors的action
*/
export const setAnchors = (anchors) => ({type: SET_ANCHORS, anchors})

/*
获得anchors的action
*/
export const getAnchors = (level) => {
  return async dispatch => {
    let request;
    if (level === 'admin') {
      request = api.reqAnchors
    } else {
      request = api.reqUserAnchors
    }
    const result = await request()
    if(result.code === 200) {
      let anchors = {};
      result.anchors.forEach((value) => {
        anchors[value.id] = value;
      })
      dispatch(setAnchors(anchors))
    } else {
      message.error("获取anchor数据失败" + result.message);
    }
  }
}

/*
设置tags的action
*/
export const setTags = (tags) => ({type: SET_TAGS, tags})

/*
获得tags的action
*/
export const getTags = (level) => {
  return async dispatch => {
    let request;
    if (level === 'admin') {
      request = api.reqTags
    } else {
      request = api.reqUserTags
    }
    const result = await request()
    if(result.code === 200) {
      dispatch(setTags(result.tag))
    } else {
      message.error("获取tag数据失败" + result.message);
    }
  }
}

/*
设置users的action
*/
export const setUsers = (users) => ({type: SET_USERS, users})

/*
获得users的action
*/
export const getUsers = () => {
  return async dispatch => {
    const result = await api.reqUsers()
    if(result.code === 200) {
      dispatch(setUsers(result.users))
    } else {
      message.error("获取tag数据失败" + result.message);
    }
  }
}

/*
设置websocket连接
*/
export const setWebsocket = (wsClient) => ({type: SET_WEBSOCKET, wsClient})

/*
设置tag的定位数据
*/
export const setTagLocationData = (tagLoactionData) => ({type: SET_TAGLOACTIONDATA, tagLoactionData})

/*
初始化websocket连接
*/
export const initWebsocket = (user) => {
  return async dispatch => {
    let W3CWebSocket = require("websocket").w3cwebsocket;

    const wsClient = new W3CWebSocket(
      `${wsUrl}/${wsRoute}?user_id=${user.id}&level=${user.level}&client_type=web`,
      "echo-protocol"
    );

    wsClient.onopen = () => {
      message.info("与服务器连接成功，开始推送实时数据");
      wsClient.send(JSON.stringify({ data: "string" }));

      wsClient.onmessage = (e) => {
        const tagLoactionData = JSON.parse(e.data);
        // 将websocket发送的tag定位数据给canvasData
        dispatch(setTagLocationData(tagLoactionData))
      };
    };

    wsClient.onerror = () => {
      message.info("与服务器连接错误");
    };

    wsClient.onclose = () => {
      message.info("与服务器连接断开");
    };

    dispatch(setWebsocket(wsClient))
  }
}