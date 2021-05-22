import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { BaseDomainRegister } from './base.domain-register';
import { Browser, Page } from 'playwright';
import { BrowserUtil } from '../utils/browser.util';

export abstract class BrowserDomainRegister extends BaseDomainRegister {
  protected browser: Browser;
  protected page: Page;

  constructor(protected storage: Map<string, any>) {
    super();
  }

  async init() {
    const domain = this.storage.get(STORAGE_KEYS.DOMAIN_KEY);

    const url = this.getUrl();

    const { browser, page } = await BrowserUtil.makeNewInstance(this.storage, domain, url);

    this.browser = browser;
    this.page = page;
  }

  protected abstract getUrl(): string;
}
