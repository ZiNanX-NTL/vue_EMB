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

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

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

// 全局安装注册富文本编辑器组件
Vue.use(VueQuillEditor)

// 全局注册时间过滤器
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
