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

// CSRF Handling — all instances share the same XSRF config
const allInstances = [
  axiosInstance,
  personaAxiosInstance,
  chatAxiosInstance,
  storageAxiosInstance,
  authorizationAxiosInstance,
];

for (const instance of allInstances) {
  instance.defaults.xsrfCookieName = 'XSRF-TOKEN';
  instance.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';
}

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

// Add authorization header + response error handler to all API clients
for (const instance of allInstances) {
  instance.interceptors.request.use(addAuthorizationHeader);
  instance.interceptors.response.use((response) => response, handleResponseError);
}


