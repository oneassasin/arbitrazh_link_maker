import { FtpHostingHandler } from './ftp.hosting-handler';
import { AxiosInstance } from 'axios';
import { CookieJar } from 'tough-cookie';
import { HttpUtil } from '../utils/http.util';

export abstract class HttpHostingHandler extends FtpHostingHandler {
  protected httpClient: AxiosInstance;
  protected cookieJar: CookieJar;

  async init() {
    const url = this.getUrl();
    const { httpClient, cookieJar } = await HttpUtil.makeHttpClient(this.storage, url);

    this.httpClient = httpClient;
    this.cookieJar = cookieJar;
  }

  protected abstract getUrl(): string;
}
