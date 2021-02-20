import * as puppeteer from 'puppeteer';
import config from '../config';
import { Browser, Page } from 'puppeteer';

const HEADER_NAME = 'content-disposition';

export class PuppeteerUtil {
  static async makeNewInstance(domain: string, url: string): Promise<{ browser: Browser, page: Page }> {
    const browser = await puppeteer.launch({
      headless: config.IS_HEADLESS_CHROME,
      args: [`--window-size=1440,990`]
    });

    const page = await browser.newPage();

    await page.goto(url);
    await page.setViewport({ width: 1440, height: 900 });

    await page['_client'].send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: this.getLinkToDownloadsFolder(domain, url),
    });

    return { browser, page };
  }

  static getLinkToDownloadsFolder(domain: string, url: string): string {
    return `./Downloads/${domain}/${new URL(url).host}`;
  }

  static parseHeadersForFileName(headers: object): string | null {
    const headerValue: string = headers[HEADER_NAME];
    if (!headerValue) {
      return null;
    }

    return headerValue.replace('attachment; filename=', '');
  }
}
