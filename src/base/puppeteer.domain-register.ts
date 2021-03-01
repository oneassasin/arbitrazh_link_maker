import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { Browser, Page } from 'puppeteer';
import { PuppeteerUtil } from '../utils/puppeteer.util';
import { BaseDomainRegister } from './base.domain-register';

export abstract class PuppeteerDomainRegister extends BaseDomainRegister {
  protected browser: Browser;
  protected page: Page;

  constructor(protected storage: Map<string, any>) {
    super();
  }

  async init() {
    const domain = this.storage.get(STORAGE_KEYS.DOMAIN_KEY);

    const url = this.getUrl();

    const { browser, page } = await PuppeteerUtil.makeNewInstance(this.storage, domain, url);

    this.browser = browser;
    this.page = page;
  }

  protected abstract getUrl(): string;
}
