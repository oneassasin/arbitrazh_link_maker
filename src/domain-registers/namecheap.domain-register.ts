import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { URLS } from '../constants/urls.constants';
import config from '../config';
import { BrowserDomainRegister } from '../base/browser.domain-register';

export class NamecheapDomainRegister extends BrowserDomainRegister {
  protected getUrl(): string {
    return URLS.NAMECHEAP_URL;
  }

  async init() {
    await super.init();
    await this.page.goto(`${URLS.NAMECHEAP_URL}myaccount/login/`);
    await this.page.waitForSelector(
      '#ctl00_ctl00_ctl00_ctl00_base_content_web_base_content_home_content_page_content_left_ctl02_loginDiv > ul > li > fieldset > div:nth-child(2) > input',
    );

    await this.page.fill(
      '#ctl00_ctl00_ctl00_ctl00_base_content_web_base_content_home_content_page_content_left_ctl02_loginDiv > ul > li > fieldset > div:nth-child(2) > input',
      config.NAMECHEAP_USER,
    );
    await this.page.fill(
      '#ctl00_ctl00_ctl00_ctl00_base_content_web_base_content_home_content_page_content_left_ctl02_loginDiv > ul > li > fieldset > div:nth-child(3) > input',
      config.NAMECHEAP_PASSWORD,
    );

    await this.page.click('#ctl00_ctl00_ctl00_ctl00_base_content_web_base_content_home_content_page_content_left_ctl02_LoginButton');

    await this.page.waitForResponse('https://ap.www.namecheap.com/', { timeout: 10000 });
  }

  async registerDomain() {
    const domain = this.storage.get(STORAGE_KEYS.DOMAIN_KEY);

    // Ввод домена
    await this.page.fill('#maincontent > div > div:nth-child(5) > div > div > div:nth-child(2) > div > form > input', domain);
    // Клик на кнопку поиска
    await this.page.click('#react-nc-search > div > div:nth-child(1) > section > article > button');

    await this.page.waitForTimeout(5000);

    // Клик на кнопку Checkout
    await this.page.click('body > div > div > div.gb-my-6 > div > div > div > div > div.mc-sticky-wrapper__holder > div > div > a');
    // Отключение автопродления
    await this.page.click('body > fragment.uishoppingcart > fragment-app-2d84e32d > div > div > div > div > div.gb-col-lg-9.gb-mb-3 > div:nth-child(2) > div > div > div.gb-row.gb-dir--column > div.gb-col-xs-12.gb-row.gb-row--no-gutters-additional.gb-row-root > div.gb-col-md-4.gb-cart-item__actions > div.gb-toggle.gb-mb-2.gb-toggle--bottom-labeled > input');
    // Клик на кнопку Confirm order
    await this.page.click('button[data-e2e-id="sc-confirm-order-btn"]');

    await this.page.waitForTimeout(5000);

    // Клик на Account funds
    await this.page.click('#po-r-3');
    // Клик на Continue
    await this.page.click('#ctl00_ctl00_ctl00_ctl00_base_content_web_base_content_home_content_page_content_left_CardControl_CartWidgetControl_btn_Submit');

    // TODO: Регистрация нового домена используя баланс аккаунта
  }

  async setupDnsServers(dnsServers: string[]) {
    const domain = this.storage.get(STORAGE_KEYS.DOMAIN_KEY);

    await this.page.goto(`https://ap.www.namecheap.com/domains/domaincontrolpanel/${domain}/domain`);
    await this.page.waitForSelector('#EdidNameServerfrm > div.form.smaller.dashed-inputs > div.row.reset-margin.nameservers-row > div.columns.medium-3 > div > div > span.h-ribbon.grey');
    await this.page.click('#EdidNameServerfrm > div.form.smaller.dashed-inputs > div.row.reset-margin.nameservers-row > div:nth-child(2) > div.columns.xsmall-9.small-5.medium-3.xlarge-3.xxlarge-3 > div > a');
    await this.page.click('#select2-results-9 > li.select2-results-dept-0.select2-result.select2-result-selectable.select2-highlighted > div');

    let index = 0;
    for (const dnsServer of dnsServers) {
      await this.page.click('#EdidNameServerfrm > div.form.smaller.dashed-inputs > div:nth-child(2) > div > div > p > a');
      await this.page.fill(`index${index}`, dnsServer);
    }

    await this.page.click('#EdidNameServerfrm > div.form.smaller.dashed-inputs > div.row.reset-margin.nameservers-row > div:nth-child(2) > div.columns.xsmall-3.medium-3.large-4.small-text-right.end > div > a.save');
  }
}
