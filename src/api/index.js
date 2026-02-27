import axios from 'axios';

// 优先使用环境变量，fallback 到北京后端地址
// 自动处理 /api 前缀
let baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://82.157.126.222:9000';
// 如果环境变量或默认值里没有 /api，就自动加上
if (!baseUrl.endsWith('/api')) {
  baseUrl += '/api';
}
const BASE_URL = baseUrl;

console.log('🔗 API Base URL:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 增加超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response.data;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data || error.message
    });
    
    // 如果是网络错误或 404，给出更友好的错误信息
    if (error.code === 'NETWORK_ERROR' || error.response?.status === 404) {
      error.message = `无法连接到服务器 ${BASE_URL}`;
    }
    
    return Promise.reject(error);
  }
);

export default api;