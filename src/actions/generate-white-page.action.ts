import { PuppeteerAction } from '../base/puppeteer.action';
import { URLS } from '../constants/urls.constants';
import config from '../config';
import { FsUtil } from '../utils/fs.util';
import { PuppeteerUtil } from '../utils/puppeteer.util';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import * as AdmZip from 'adm-zip';

export class GenerateWhitePageAction extends PuppeteerAction {
  protected getUrl(): string {
    return URLS.PL_AD_RED_URL;
  }

  protected async onInit() {
    await this.page.goto(`${URLS.PL_AD_RED_URL}site/login`);

    await this.page.type('#loginform-username', config.AD_RED_RU_USER);
    await this.page.type('#loginform-password', config.AD_RED_RU_PASSWORD);

    await this.page.click('button[name="login-button"]');

    await this.page.waitForTimeout(3000);
  }

  async doAction() {
    const languageItemIndex = this.storage.get(STORAGE_KEYS.WHITE_PAGE_LANGUAGE_KEY) + 1;
    const thematicItemIndex = this.storage.get(STORAGE_KEYS.WHITE_PAGE_THEMATIC_KEY) + 1;

    // Выбрать язык и тематику
    await this.page.evaluate((languageIndex, thematicIndex) => {
        const item = document.querySelector(`#language option:nth-child(${languageIndex})`);
        item['selected'] = true;

        const secItem = document.querySelector(`#theme option:nth-child(${thematicIndex})`);
        secItem['selected'] = true;
      },
      languageItemIndex,
      thematicItemIndex,
    );

    // Нажали "Сгенерировать новую"
    await this.page.click('body div.container.no-padding div.row.justify-content-md-center.mb-5 div:nth-child(4) button');

    await this.page.click('a.btn-buy');

    const link = await this.page.$eval(
      'body div.container.no-padding div.row.justify-content-md-center.mt-5 div.col-sm-3.col-md-3.mb-2.mt-3 a',
      element => {
        return element.getAttribute('href');
      },
    );

    await new Promise(async resolve => {
      this.page.on('response', async response => {
        if (response.request().url() === link) {
          const fileName = PuppeteerUtil.parseHeadersForFileName(response.headers());
          const domain = this.storage.get(STORAGE_KEYS.DOMAIN_KEY);
          const filePathName = `${PuppeteerUtil.getLinkToDownloadsFolder(domain, this.getUrl())}/${fileName}`;

          const buffer = await FsUtil.readFileFromPath(filePathName);
          resolve(buffer);
        }
      });

      try {
        await this.page.goto(link);
      } catch (ignore) {
      }
    });
  }

  async doPersistAction() {
    const domain = this.storage.get(STORAGE_KEYS.DOMAIN_KEY);
    const basePath = PuppeteerUtil.getLinkToDownloadsFolder(domain, this.getUrl());

    const fileNames = await FsUtil.findFilesByGlob(`${basePath}/*.zip`);
    const filePathName = fileNames[0];
    // const filePathName = `${PuppeteerUtil.getLinkToDownloadsFolder(domain, this.getUrl())}/${fileNames[0]}`;

    let buffer = await FsUtil.readFileAsStringFromPath(filePathName);

    const archive = new AdmZip(buffer);

    const newArchive = new AdmZip();

    const regExp = /frontend\/web\/generated\/.+\/html\/(.*)/;

    for (const entry of archive.getEntries()) {
      const name = entry.entryName;

      const result = regExp.exec(name);

      if (result === null || result.length === 1 || result[1] === '') {
        continue;
      }

      if (result[1][result[1].length - 1] === '/') {
        newArchive.addFile(result[1], Buffer.from(''), entry.comment, entry.attr);
        continue;
      }

      const data: Buffer = await new Promise<Buffer>(resolve => entry.getDataAsync(resolve));

      newArchive.addFile(result[1], data, entry.comment, entry.attr);
    }

    this.saveFile('white.zip', newArchive.toBuffer());
  }
}
