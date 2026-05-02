import axios from 'axios';
import config from '@/config';
import { toast } from '@/hooks/use-toast';


const getBaseURL = (apiConfig: { baseUrl: string; targetLocal: string }) => {
  return process.env.NODE_ENV === 'development'
      ? apiConfig.targetLocal
      : apiConfig.baseUrl;
};


export const axiosInstance = axios.create({
  baseURL: getBaseURL(config.api),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const gatewayAxiosInstance = axios.create({
  baseURL: getBaseURL(config.gatewayApi),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const personaAxiosInstance = axios.create({
  baseURL: getBaseURL(config.personaApi),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatAxiosInstance = axios.create({
  baseURL: getBaseURL(config.chatApi),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const storageAxiosInstance = axios.create({
  baseURL: getBaseURL(config.storageApi),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// CSRF Handling
// We expect the backend to set a cookie named XSRF-TOKEN (standard Spring Security behavior)
// Axios automatically looks for this cookie and sets the X-XSRF-TOKEN header if xsrfCookieName and xsrfHeaderName are configured.
// However, standard Spring Boot defaults are often XSRF-TOKEN and X-XSRF-TOKEN.
axiosInstance.defaults.xsrfCookieName = 'XSRF-TOKEN';
gatewayAxiosInstance.defaults.xsrfCookieName = 'XSRF-TOKEN';
axiosInstance.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';
gatewayAxiosInstance.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';



personaAxiosInstance.defaults.xsrfCookieName = 'XSRF-TOKEN';
personaAxiosInstance.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';
chatAxiosInstance.defaults.xsrfCookieName = 'XSRF-TOKEN';
chatAxiosInstance.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

// Request interceptor to add Authorization header
const addAuthorizationHeader = (requestConfig: any) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
};

// Interceptor to handle 403 errors globally
const handleForbiddenError = (error: any) => {
  if (error.response && error.response.status === 403) {
    toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You do not have permission to perform this action."
    });
  }

  if (error.response && error.response.status === 401) {
    console.error('[API Error] 401 Unauthorized:', error.config?.url);
  }

  return Promise.reject(error);
};

// Add authorization header to all API clients
axiosInstance.interceptors.request.use(addAuthorizationHeader);
gatewayAxiosInstance.interceptors.request.use(addAuthorizationHeader);
personaAxiosInstance.interceptors.request.use(addAuthorizationHeader);
chatAxiosInstance.interceptors.request.use(addAuthorizationHeader);
storageAxiosInstance.interceptors.request.use(addAuthorizationHeader);

axiosInstance.interceptors.response.use((response) => response, handleForbiddenError);
gatewayAxiosInstance.interceptors.response.use((response) => response, handleForbiddenError);
personaAxiosInstance.interceptors.response.use((response) => response, handleForbiddenError);
chatAxiosInstance.interceptors.response.use((response) => response, handleForbiddenError);
storageAxiosInstance.interceptors.response.use((response) => response, handleForbiddenError);


