/*
能发送异步ajax请求的函数模块
封装axios库
函数的返回值是promise对象
1. 优化1: 统一处理请求异常?
    在外层包一个自己创建的promise对象
    在请求出错时, 不reject(error), 而是显示错误提示
2. 优化2: 异步得到不是reponse, 而是response.data
   在请求成功resolve时: resolve(response.data)
 */

import axios from 'axios'
import {message} from 'antd'
import storageUtils from '../../src/utils/storageUtils'
const {token} = storageUtils.getUser()
const headers = { token };

export default function ajax(url, data={}, type='GET') {

  return new Promise((resolve, reject) => {
    let promise
    // 1. 执行异步ajax请求
    if(type==='GET') { // 发GET请求 get(url[, config])
      promise = axios.get(url, { // 配置对象
        params: data, // 指定请求参数
        headers
      })
    } else if(type==='POST'){ // 发POST请求 post(url[, data[, config]])
      promise = axios.post(url, data, {headers})
    } else if(type==='PUT'){ // 发PUT请求 put(url[, data[, config]])
      promise = axios.put(url, data, {headers})
    } else if(type==='DELETE'){ // 发DELETE请求 axios#delete(url[, config])
      promise = axios.delete(url, {data, headers})
    }
    // 2. 如果成功了, 调用resolve(value)
    promise.then(response => {
      resolve(response.data)
    // 3. 如果失败了, 不调用reject(reason), 而是提示异常信息
    }).catch(error => {
      // reject(error)
      message.error("请求失败: " + error.response.data.message)
      resolve(error.response.data)
      // message.error('请求出错了: ' + error.message)
    })
  })


}

// 请求登陆接口
// ajax('/login', {username: 'Tom', passsword: '12345'}, 'POST').then()
// 添加用户
// ajax('/manage/user/add', {username: 'Tom', passsword: '12345', phone: '13712341234'}, 'POST').then()
