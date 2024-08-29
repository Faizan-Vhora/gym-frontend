import axios from 'axios';
import { toast } from 'react-toastify';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001/', // replace with your API base URL
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Replace with your token storage mechanism
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Display the error message using react-toastify
    toast.error(error.response?.data?.message || 'An error occurred, please try again.');
    return Promise.reject(error);
  }
);

export default axiosInstance;
