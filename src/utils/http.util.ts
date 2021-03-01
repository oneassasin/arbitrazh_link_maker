import axios, { AxiosInstance } from 'axios';
import { CookieJar } from 'tough-cookie';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import * as tough from 'tough-cookie';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';

axiosCookieJarSupport(axios);

export class HttpUtil {
  static makeHttpClient(storage: Map<string, any>, baseURL: string): { httpClient: AxiosInstance, cookieJar: CookieJar } {
    const cookieJar = new tough.CookieJar();

    const httpClient = axios.create({
      baseURL,
      jar: cookieJar,
    });

    let httpObject = storage.get(STORAGE_KEYS.HTTP_STORAGE_KEY);
    if (!httpObject) {
      httpObject = {};
    }

    httpObject[baseURL] = { httpClient, cookieJar };

    return { httpClient, cookieJar };
  }
}
