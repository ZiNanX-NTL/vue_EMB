import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 字体图标
import './assets/fonts/iconfont.css'
// 全局样式
import './assets/css/global.css'

// 引入表格插件
import TreeTabel from 'vue-table-with-tree-grid'

import axios from 'axios'
// 配置请求的默认根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 设置请求拦截器
axios.interceptors.request.use(config => {
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')// 请求处理,每次请求携带token令牌
  return config// 请求数据
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

// 全局组册表格插件
Vue.component('tree-tabel', TreeTabel)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
