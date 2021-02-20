import { PuppeteerHostingHandler } from '../base/puppeteer.hosting-handler';
import config from '../config';
import { URLS } from '../constants/urls.constants';
import { AccessOptions } from 'basic-ftp';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';

export class BegetHostingHandler extends PuppeteerHostingHandler {
  protected getUrl(): string {
    return URLS.BEGET_URL;
  }

  async registerDomain() {
    const domain = this.storage.get(STORAGE_KEYS.DOMAIN_KEY);

    await this.page.goto(`${URLS.BEGET_URL}domains/register`);

    await this.page.type('#fqdn', domain);

    await this.page.click('button[st="button-domains-register-name"]');

    // Установка checkbox в Private Person
    await this.page.click('#private_person');

    // Отключаем автопродление
    await this.page.click('#auto-renew');

    // Принимаем правила
    await this.page.click('#accept-rules');

    await this.page.waitForResponse(`${URLS.BEGET_URL}domains/register`);
  }

  formatDestinationPathForDomain(): string {
    const domain = this.storage.get(STORAGE_KEYS.DOMAIN_KEY);
    return `/${domain}/public_html`;
  }

  protected async onInit() {
    await this.page.type('#cp-login-login-input', config.BEGET_USER);
    await this.page.type('#cp-login-password-input', config.BEGET_PASSWORD);

    await this.page.click('#cp-login-submit-btn');

    await this.page.waitForResponse(`${URLS.BEGET_URL}main`);
  }

  protected getFtpAccessOptions(): AccessOptions {
    return {
      host: `${config.BEGET_USER}.beget.tech`,
      user: config.BEGET_USER,
      password: config.BEGET_PASSWORD,
      secure: true,
      port: 21,
    };
  }
}
