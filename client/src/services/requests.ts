import { message } from 'antd';
import axios from './axios';
import { ServerStatus } from '../models/models';

message.config({ duration: 5, maxCount: 1 });

const SERVER_URL: string =
  process.env.REACT_APP_SERVER_URL || 'http://127.0.0.1:3001';

/**
 * sessions
 */

/**
 * gets the current server session, tsp status and tsp log
 * @returns the current server status
 */
export const fetchServerStatus = async (): Promise<{
  status?: ServerStatus;
  error?: number;
}> => {
  const data = await axios
    .get(`${SERVER_URL}/session/status`)
    .then((response) => {
      return { status: response.data as ServerStatus };
    })
    .catch((error) => {
      if (!error.response) return { error: 500 };
      else return { error: error.response.status };
    });
  return data;
};

/**
 * fetches session key from backend
 * if local storage provides a saved key, it will be send in header to compare to the current session key
 * @returns either the current session key as result or an error
 */
export const fetchSessionKey = async (): Promise<{
  result?: string;
  error?: number;
}> => {
  const response: { error?: number; result?: string } = await axios
    .get(`${SERVER_URL}/session/login`)
    .then((res: any) => {
      localStorage.setItem('sessionkey', res.data);
      return { result: res.data };
    })
    .catch((error: any) => {
      if (error.response) return { error: error.response.status };
      else return { error: 500 };
    });

  return response;
};

/**
 * ends the current session and stop tsp
 * clears the saved session key in local storage
 * refresh the page to discard all states
 */
export const sessionLogout = async (logout: any) => {
  await axios
    .get(`${SERVER_URL}/session/logout`)
    .catch((error: any) => console.error(error.message));

  localStorage.removeItem('sessionkey');
  setTimeout(() => logout(), 1000); // cause of local storage delay
};

/**
 * files
 */
export const fetchInputFiles = async () => {
  const response = await axios
    .get(`${SERVER_URL}/api/tsfiles/input/`)
    .then((res: any) => res.data)
    .catch((error: any) => {
      console.error(error.message);
      return;
    });
  return response;
};

export const fetchOutputFiles = async () => {
  const response = await axios
    .get(`${SERVER_URL}/api/tsfiles/output/`)
    .then((res: any) => res.data)
    .catch((error: any) => {
      console.error(error.message);
      return;
    });
  return response;
};

export const fetchXml = async (file: string) => {
  const response = await axios
    .get(
      `${SERVER_URL}/api/tsfiles/output/xml/${file.substring(
        0,
        file.length - 4
      )}`
    )
    .then((res: any) => res.data)
    .catch((error: any) => {
      console.error(error.message);
      return;
    });
  return response;
};

export const downloadFile = async (file: string, type: string) => {
  await axios
    .get(
      `${SERVER_URL}/api/tsFiles/output/${type}/${file.substring(
        0,
        file.length - (type === 'ts' ? 3 : 4)
      )}`,
      { responseType: 'blob' }
    )
    .then((response) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data, ...rest } = response;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file);
      document.body.appendChild(link);
      link.click();
      link.remove();
    })
    .catch((error) => message.error(error.message));
};

export const fetchLiveServices = async () => {
  const response = await axios
    .get(`${SERVER_URL}/api/tsp/tuning-channels`)
    .then((res: any) => res.data)
    .catch((error: any) => {
      console.error(error.message);
      return;
    });
  return response;
};

/**
 * tsp
 */

export const runTsp = async (params: Record<string, any>) => {
  const response = await axios
    .post(`${SERVER_URL}/api/tsp/run/`, params)
    .then((res: any) => res.data)
    .catch((error: any) => {
      if (error.response?.data) return { error: error.response.data.error };
      else return { error: 'TSP Error. Please check the TSP Log.' };
    });
  return response;
};

export const stopTsp = async () => {
  const response = await axios
    .get(`${SERVER_URL}/api/tsp/stop/`)
    .then((res: any) => res.data)
    .catch((error: any) => {
      console.error(error.message);
      return;
    });
  return response;
};

export const fetchAnalyze = async (params: {
  type: 'live' | 'file';
  file?: string;
  service?: string;
}) => {
  const response = await axios
    .post(`${SERVER_URL}/api/tsp/analyze/`, params)
    .then((res: any) => res.data)
    .catch((error: any) => {
      console.error(error.message);
      return;
    });
  return response;
};
