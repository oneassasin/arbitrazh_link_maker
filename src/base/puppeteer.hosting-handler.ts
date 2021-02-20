import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { Browser, Page } from 'puppeteer';
import { PuppeteerUtil } from '../utils/puppeteer.util';
import { FtpHostingHandler } from './ftp.hosting-handler';

export abstract class PuppeteerHostingHandler extends FtpHostingHandler {
  protected browser: Browser;
  protected page: Page;

  async init() {
    const domain = this.storage.get(STORAGE_KEYS.DOMAIN_KEY);

    const url = this.getUrl();

    const { browser, page } = await PuppeteerUtil.makeNewInstance(domain, url);

    let puppeteerObject = this.storage.get(STORAGE_KEYS.PUPPETEER_STORAGE_KEY);
    if (!puppeteerObject) {
      puppeteerObject = {};
    }

    puppeteerObject[url] = { browser, page };
    this.storage.set(STORAGE_KEYS.PUPPETEER_STORAGE_KEY, puppeteerObject);

    this.browser = browser;
    this.page = page;

    await super.init();
  }

  protected abstract getUrl(): string;
}
