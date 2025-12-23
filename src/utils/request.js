import axios from 'axios'
import { showToast } from 'vant'

// 创建 axios 实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || '', // url = base url + request url
  timeout: 5000 // request timeout
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    // 例如：config.headers['X-Token'] = getToken()
    return config
  },
  error => {
    // 对请求错误做些什么
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  /**
   * 如果你想要获取 http 信息，例如 headers 或 status
   * 请 return  response => response
  */

  /**
   * 下面的逻辑可根据自定义状态码修改
   */
  response => {
    const res = response.data

    // 假设 200 是成功状态码
    if (response.status !== 200) {
      showToast(res.message || 'Error')
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    showToast(error.message)
    return Promise.reject(error)
  }
)

export default service
