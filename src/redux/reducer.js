/*
用来根据老的state和指定的action生成并返回新的state的函数
 */
import {combineReducers} from 'redux'

/*
用来管理头部标题的reducer函数
 */
import storageUtils from "../utils/storageUtils"
import {
  RECEIVE_USER,
  RESET_USER,
  SET_ANCHORS,
  SET_TAGS,
  SET_USERS,
  SET_WEBSOCKET,
  SET_TAGLOACTIONDATA,
} from './actions'

/*
用来管理当前登陆用户的reducer函数
 */
const initUser = storageUtils.getUser()

function user(state = initUser, action) {
  switch (action.type) {
    case RECEIVE_USER:
      return action.user
    case RESET_USER:
      return {}
    default:
      return state
  }
}

function anchors(state = {}, action) {
  switch (action.type) {
    case SET_ANCHORS:
      return action.anchors
    default:
      return state
  }
}

function tags(state = [], action) {
  switch (action.type) {
    case SET_TAGS:
      return action.tags
    default:
      return state
  }
}

function users(state = [], action) {
  switch (action.type) {
    case SET_USERS:
      return action.users
    default:
      return state
  }
}

function wsClient(state = null, action) {
  switch (action.type) {
    case SET_WEBSOCKET:
      return action.wsClient
    default:
      return state
  }
}

function tagLoactionData(state = {}, action) {
  switch (action.type) {
    case SET_TAGLOACTIONDATA:
      return action.tagLoactionData
    default:
      return state
  }
}

export default combineReducers({
  user,
  anchors,
  tags,
  users,
  wsClient,
  tagLoactionData,
})