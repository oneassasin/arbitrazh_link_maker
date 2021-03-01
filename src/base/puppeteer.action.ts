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

    const { browser, page } = await PuppeteerUtil.makeNewInstance(this.storage, domain, url);

    this.browser = browser;
    this.page = page;

    await super.init();
  }

  protected abstract getUrl(): string;
}
