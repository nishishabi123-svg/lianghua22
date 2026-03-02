import axios from 'axios';

// API基础配置
const BASE_URL = 'http://82.157.126.222:9000'; 

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// 智能响应拦截器：兼容处理有data和没data的情况
api.interceptors.response.use(
  (response) => {
    // 如果后端返回的对象里已经包含status，说明是扁平结构，直接返回
    if (response.data && response.data.status) {
      return response.data;
    }
    // 否则返回原始data块
    return response.data;
  },
  (error) => Promise.reject(error)
);

export default api;