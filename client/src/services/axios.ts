import axios from 'axios';
import { fetchServerStatus, fetchSessionKey } from './requests';

const instance = axios.create();

instance.interceptors.request.use(
  async (config) => {
    const localKey = localStorage.getItem('sessionkey');
    if (localKey) instance.defaults.headers.common['SessionKey'] = localKey;
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403)
        localStorage.removeItem('sessionkey');
      if (error.response.status === 401) {
        const loginResponse = await fetchSessionKey();
        if (loginResponse.result) await fetchServerStatus();
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
