import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Response interceptor to handle Render Sleep mode
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config || !config.retryCount) config.retryCount = 0;
    
    // Retry up to 3 times on typical server sleep/startup errors
    if (config.retryCount < 3 && (!error.response || error.response.status >= 502)) {
      config.retryCount += 1;
      const delay = 3000;
      console.log(`Connection delay detected, retrying request in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return api(config);
    }
    return Promise.reject(error);
  }
);

export default api;
