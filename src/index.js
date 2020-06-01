/*
入口js
 */
import React from 'react'
import ReactDOM from 'react-dom'

// IE浏览器支持
import  "react-app-polyfill/ie11";
import  "react-app-polyfill/stable";


import { Provider } from 'react-redux'

import store from './redux/store'
import App from './App'

// 将App组件标签渲染到index页面的div上
ReactDOM.render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('root'))