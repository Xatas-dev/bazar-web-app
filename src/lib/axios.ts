import axios from 'axios';
import config from '@/config';
import { toast } from '@/hooks/use-toast';


const getBaseURL = (apiConfig: { baseUrl: string; targetLocal: string }) => {
  return process.env.NODE_ENV === 'development'
      ? apiConfig.targetLocal   // локально используем mock / dev
      : apiConfig.baseUrl; // в проде настоящий backend
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

// Interceptor to handle 403 errors globally
const handleForbiddenError = (error: any) => {
  if (error.response && error.response.status === 403) {
    toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You do not have permission to perform this action."
    });
  }
  return Promise.reject(error);
};

axiosInstance.interceptors.response.use((response) => response, handleForbiddenError);
gatewayAxiosInstance.interceptors.response.use((response) => response, handleForbiddenError);
personaAxiosInstance.interceptors.response.use((response) => response, handleForbiddenError);
chatAxiosInstance.interceptors.response.use((response) => response, handleForbiddenError);


