import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance with default config
export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Set authentication token
 */
export function setAuthToken(token: string): void {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

/**
 * Clear authentication token
 */
export function clearAuthToken(): void {
  delete api.defaults.headers.common['Authorization'];
}

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle errors
    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data as { error?: { message?: string } };
      const errorMessage = errorData?.error?.message || error.message;
      console.error(`[API Error] ${error.response.status}: ${errorMessage}`);
    } else if (error.request) {
      // Request made but no response
      console.error('[API Error] No response received from server');
    } else {
      // Error in request setup
      console.error('[API Error]', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
