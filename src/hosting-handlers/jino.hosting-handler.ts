import { PuppeteerHostingHandler } from '../base/puppeteer.hosting-handler';
import config from '../config';
import { URLS } from '../constants/urls.constants';
import { AccessOptions } from 'basic-ftp';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';

export class JinoHostingHandler extends PuppeteerHostingHandler {
  protected getUrl(): string {
    return URLS.JINO_URL;
  }

  async registerDomain() {
    const domain = this.storage.get(STORAGE_KEYS.DOMAIN_KEY);

    await this.page.goto(`${this.getUrl()}domains/registration/`);

    await this.page.type('#regdom-checkinput-one', domain);

    await this.page.click('#regdom-checkbut-one');

    await this.page.waitForSelector('.regdom-checktable-step2', {timeout: 5000});

    await this.page.click('.regdom-checktable-step2');

    await this.page.waitForTimeout(3000);

    await this.page.type('#id_r-lastname_ru', 'Ivanov');

    await this.page.type('#id_r-firstname_ru', 'Ivan');

    await this.page.type('#id_r-secondname_ru', 'Ivanovich');

    await this.page.type('#id_r-secondname_ru', 'Ivanovich');

    await this.page.select('#id_r-birth_date_0', '1');

    await this.page.select('#id_r-birth_date_1', '1');

    await this.page.select('#id_r-birth_date_2', '1991');

    await this.page.type('#id_r-passport', '4502 453123, выдан ОВД р-на "Дмитровский", г. Москвы, 19.08.2001');

    await this.page.type('#id_r-postalcode', '109518');

    await this.page.type('#id_r-street_ru', 'Суворова, д. 3/4');

    await this.page.type('#id_r-phone', '+79123121211');

    await this.page.click('#id_autorenew');

    await this.page.click('#id_bind_to');

    await this.page.click('li[data-value="hosting"]');

    await this.page.click('.button-submit');

    await this.page.waitForTimeout(3000);

    await this.page.click('#regdom-submit');

    await this.page.waitForResponse(`${this.getUrl()}domains/registration/`);
  }

  formatDestinationPathForDomain(): string {
    const domain = this.storage.get(STORAGE_KEYS.DOMAIN_KEY);
    return `/${domain}`;
  }

  protected async onInit() {
    await this.page.type('input[name="login"]', config.JINO_USER);
    await this.page.type('input[name="password"]', config.JINO_PASSWORD);

    await this.page.click('#authpage > div.authpage-formwrapper-login > form > div.form-row.form-controls > button');

    await this.page.waitForResponse(URLS.JINO_URL);
  }

  protected getFtpAccessOptions(): AccessOptions {
    return {
      host: `${config.JINO_USER}.myjino.ru`,
      user: config.JINO_USER,
      password: config.JINO_PASSWORD,
      secure: true,
      port: 21,
    };
  }
}
