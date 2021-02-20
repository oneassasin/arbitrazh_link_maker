import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { PuppeteerUtil } from '../utils/puppeteer.util';
import { Browser, Page } from 'puppeteer';
import { FileAction } from './file.action';

export abstract class PuppeteerAction extends FileAction {
  protected browser: Browser;
  protected page: Page;

  async init() {
    const domain = this.storage.get(STORAGE_KEYS.DOMAIN_KEY);

    const url = this.getUrl();

    let puppeteerObject = this.storage.get(STORAGE_KEYS.PUPPETEER_STORAGE_KEY);
    if (!puppeteerObject) {
      puppeteerObject = {};
      this.storage.set(STORAGE_KEYS.PUPPETEER_STORAGE_KEY, puppeteerObject);
    }

    const { browser, page } = await PuppeteerUtil.makeNewInstance(domain, url);

    puppeteerObject[url] = { browser, page };
    this.storage.set(STORAGE_KEYS.PUPPETEER_STORAGE_KEY, puppeteerObject);

    this.browser = browser;
    this.page = page;

    await super.init();
  }

  protected abstract getUrl(): string;
}
