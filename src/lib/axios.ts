import axios from 'axios';
import config from '@/config';
import { notify } from '@/lib/notifications';


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

export const authorizationAxiosInstance = axios.create({
  baseURL: getBaseURL(config.authorizationApi),
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
authorizationAxiosInstance.defaults.xsrfCookieName = 'XSRF-TOKEN';
authorizationAxiosInstance.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

// Request interceptor to add Authorization header
const addAuthorizationHeader = (requestConfig: any) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
};

// Global response error interceptor
const handleResponseError = (error: any) => {
  if (error.response) {
    const status = error.response.status;

    switch (status) {
      case 400:
        notify.error.validation("The request could not be processed.");
        break;
      case 401:
        notify.error.unauthorized();
        break;
      case 403:
        notify.error.forbidden();
        break;
      case 404:
        notify.error.notFound();
        break;
      case 409:
        notify.error.validation("This operation conflicts with the current state.");
        break;
      case 422:
        notify.error.validation("The provided data is invalid.");
        break;
      case 500:
      case 502:
      case 503:
        notify.error.serverError();
        break;
      default:
        if (status >= 500) {
          notify.error.serverError();
        }
        break;
    }
  } else if (error.code === 'ECONNABORTED') {
    notify.error.timeout();
  } else if (!error.response) {
    notify.error.networkError();
  }

  return Promise.reject(error);
};

// Add authorization header to all API clients
axiosInstance.interceptors.request.use(addAuthorizationHeader);
gatewayAxiosInstance.interceptors.request.use(addAuthorizationHeader);
personaAxiosInstance.interceptors.request.use(addAuthorizationHeader);
chatAxiosInstance.interceptors.request.use(addAuthorizationHeader);
storageAxiosInstance.interceptors.request.use(addAuthorizationHeader);
authorizationAxiosInstance.interceptors.request.use(addAuthorizationHeader);

axiosInstance.interceptors.response.use((response) => response, handleResponseError);
gatewayAxiosInstance.interceptors.response.use((response) => response, handleResponseError);
personaAxiosInstance.interceptors.response.use((response) => response, handleResponseError);
chatAxiosInstance.interceptors.response.use((response) => response, handleResponseError);
storageAxiosInstance.interceptors.response.use((response) => response, handleResponseError);
authorizationAxiosInstance.interceptors.response.use((response) => response, handleResponseError);


