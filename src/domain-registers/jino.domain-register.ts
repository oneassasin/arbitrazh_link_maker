import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import config from '../config';
import { URLS } from '../constants/urls.constants';
import { BrowserDomainRegister } from '../base/browser.domain-register';

export class JinoDomainRegister extends BrowserDomainRegister {
  protected getUrl(): string {
    return URLS.JINO_URL;
  }

  async init() {
    await super.init();
    await this.page.fill('input[name="login"]', config.JINO_USER);
    await this.page.fill('input[name="password"]', config.JINO_PASSWORD);

    await this.page.click('#authpage > div.authpage-formwrapper-login > form > div.form-row.form-controls > button');

    await this.page.waitForTimeout(2500);
  }

  async registerDomain() {
    const domain = this.storage.get(STORAGE_KEYS.DOMAIN_KEY);

    await this.page.goto(`${this.getUrl()}domains/registration/`);

    await this.page.fill('#regdom-checkinput-one', domain);

    await this.page.click('#regdom-checkbut-one');

    await this.page.waitForSelector('.regdom-checktable-step2', { timeout: 5000 });

    await this.page.click('.regdom-checktable-step2');

    await this.page.waitForTimeout(3000);

    await this.page.fill('#id_r-lastname_ru', 'Ivanov');

    await this.page.fill('#id_r-firstname_ru', 'Ivan');

    await this.page.fill('#id_r-secondname_ru', 'Ivanovich');

    await this.page.fill('#id_r-secondname_ru', 'Ivanovich');

    await this.page.selectOption('#id_r-birth_date_0', '1');

    await this.page.selectOption('#id_r-birth_date_1', '1');

    await this.page.selectOption('#id_r-birth_date_2', '1991');

    await this.page.fill('#id_r-passport', '4502 453123, выдан ОВД р-на "Дмитровский", г. Москвы, 19.08.2001');

    await this.page.fill('#id_r-postalcode', '109518');

    await this.page.fill('#id_r-street_ru', 'Суворова, д. 3/4');

    await this.page.fill('#id_r-phone', '+79123121211');

    await this.page.click('#id_autorenew');

    await this.page.click('#id_bind_to');

    await this.page.click('li[data-value="hosting"]');

    await this.page.click('.button-submit');

    await this.page.waitForTimeout(3000);

    await this.page.click('#regdom-submit');

    await this.page.waitForResponse(`${this.getUrl()}domains/registration/`);
  }

  async setupDnsServers(dnsServers: string[]) {
    // TODO: Сделать добавление DNS имен
  }
}
