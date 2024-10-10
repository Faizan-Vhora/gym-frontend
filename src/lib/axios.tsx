import { APP_BASE_URL } from '@/app-config';
import axios from 'axios';
import type { AxiosError } from 'axios';
import { toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

// Define the expected error response structure
interface ErrorResponse {
  message: string;
}

// Create a helper function to ensure proper error typing
const createError = (message = 'Server Error'): Error => {
  return new Error(message);
};

const axiosInstance = axios.create({
  // baseURL: 'http://18.188.170.111:3001/',
  baseURL: APP_BASE_URL,
});

// Adding an Authorization header if a token exists
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Replace with your token storage mechanism
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (_error) => {
    // Handle request errors here if needed
    return Promise.reject(new Error('An unexpected error occurred'));
  }
);

// Handling response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    // Display the error message using react-toastify
    const errorMessage = error.response?.data?.message || 'An error occurred, please try again.';

    errorMessage.split(',').forEach((message: string) => {
      toast.error(message);
    });
    // Create a standardized Error object for rejection
    return Promise.reject(createError(errorMessage));
  }
);

export default axiosInstance;
