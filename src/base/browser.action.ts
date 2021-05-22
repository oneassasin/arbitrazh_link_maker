import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { FileAction } from './file.action';
import { Browser, Page } from 'playwright';
import { BrowserUtil } from '../utils/browser.util';

export abstract class BrowserAction extends FileAction {
  protected browser: Browser;
  protected page: Page;

  async init() {
    const domain = this.storage.get(STORAGE_KEYS.DOMAIN_KEY);

    const url = this.getUrl();

    const { browser, page } = await BrowserUtil.makeNewInstance(this.storage, domain, url);

    this.browser = browser;
    this.page = page;

    await super.init();
  }

  protected abstract getUrl(): string;
}
