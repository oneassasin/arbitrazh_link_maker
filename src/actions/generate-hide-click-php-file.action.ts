import { PuppeteerAction } from '../base/puppeteer.action';
import { URLS } from '../constants/urls.constants';
import config from '../config';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { FsUtil } from '../utils/fs.util';
import { PuppeteerUtil } from '../utils/puppeteer.util';

export class GenerateHideClickPhpFileAction extends PuppeteerAction {
  protected getUrl(): string {
    return URLS.HIDE_CLICK_URL;
  }

  async doAction() {
    const domain: string = await this.storage.get(STORAGE_KEYS.DOMAIN_KEY);

    await this.page.type('#form0', config.HIDE_CLICK_TOKEN);

    await this.page.type('#form1', `https://${domain}/index.html`);

    await this.page.type('#form2', `https://${domain}/__page__/index.html`);

    await this.page.type('#form3', 'UA');

    await new Promise(async resolve => {
      this.page.on('response', response => {
        const url = response.request().url();
        const method = response.request().method();

        if (url === 'https://hide.click/download.php' && method === 'POST') {
          resolve();
        }
      });

      await this.page.click('#download');
    });
  }

  async doPersistAction() {
    const domain = this.storage.get(STORAGE_KEYS.DOMAIN_KEY);
    const basePath = PuppeteerUtil.getLinkToDownloadsFolder(domain, this.getUrl());

    const fileNames = await FsUtil.findFilesByGlob(`${basePath}/index.php`);
    const filePathName = fileNames[0];

    let buffer = await FsUtil.readFileAsStringFromPath(filePathName);

    buffer = buffer
      .replace("['DEBUG_MODE'] = 'on'", "['DEBUG_MODE'] = 'off'")
      .replace("['STEALTH'] = 'off'", "['STEALTH'] = 'on'");

    this.saveFile('index.php', Buffer.from(buffer), this.getUrl());
  }
}
