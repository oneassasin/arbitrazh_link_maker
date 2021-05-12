import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import config from '../config';
import { URLS } from '../constants/urls.constants';
import { PuppeteerDomainRegister } from '../base/puppeteer.domain-register';

export class BegetDomainRegister extends PuppeteerDomainRegister {
  protected getUrl(): string {
    return URLS.BEGET_URL;
  }

  async init() {
    await super.init();
    await this.page.type('#cp-login-login-input', config.BEGET_USER);
    await this.page.type('#cp-login-password-input', config.BEGET_PASSWORD);

    await this.page.click('#cp-login-submit-btn');

    await this.page.waitForTimeout(5000);
  }

  async registerDomain() {
    const domain = this.storage.get(STORAGE_KEYS.DOMAIN_KEY);

    await this.page.goto(`${URLS.BEGET_URL}domains/register`, { waitUntil: 'networkidle2' });

    await this.page.waitForTimeout(2500);

    await this.page.type('#fqdn', domain);

    await this.page.waitForTimeout(1000);

    await this.page.click(`div[title="${domain}"]`);

    await this.page.waitForTimeout(1000);

    await this.page.click('button[st="button-domains-register-name"]');

    await this.page.waitForTimeout(2500);

    // Установка checkbox в Private Person
    await this.page.click('#private_person');

    await this.page.waitForTimeout(2500);

    // Отключаем автопродление
    await this.page.click('#auto-renew');

    // Принимаем правила
    await this.page.click('#accept-rules', { delay: 5000 });

    await this.page.waitForResponse(`${URLS.BEGET_URL}domains/register`);
  }

  async setupDnsServers(dnsServers: string[]) {
    // TODO: Сделать добавление DNS имен
  }
}
