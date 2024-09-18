import axios from 'axios';
import type { AxiosError } from 'axios';
import { toast } from 'react-toastify';

// Define the expected error response structure
interface ErrorResponse {
  message: string;
}

// Create a helper function to ensure proper error typing
const createError = (message: string): Error => {
  return new Error(message);
};

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001/',
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
    toast.error(errorMessage);

    // Create a standardized Error object for rejection
    return Promise.reject(createError(errorMessage));
  }
);

export default axiosInstance;
