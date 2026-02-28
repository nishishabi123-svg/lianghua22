import axios from 'axios';

// 彻底去除自动拼接逻辑，保证干净
const BASE_URL = 'http://82.157.126.222:9000'; 

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// 响应拦截器：直接解出 data
api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

export default api;