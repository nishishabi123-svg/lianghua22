import axios from 'axios';

// 直接指向北京服务器地址，不要在这里拼 /api
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://82.157.126.222:9000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// 响应拦截器：直接解出 data 简化组件调用
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.message);
    return Promise.reject(error);
  }
);

export default api;