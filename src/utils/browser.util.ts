import config from '../config';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { Browser, chromium, Page } from 'playwright';

export class BrowserUtil {
  static async makeNewInstance(storage: Map<string, any>,
                               domain: string,
                               url: string): Promise<{ browser: Browser, page: Page }> {
    const browser = await chromium.launch({
      headless: config.IS_HEADLESS_CHROME,
      args: [`--window-size=1440,990`],
      downloadsPath: this.getLinkToDownloadsFolder(domain, url),
      slowMo: 50,
    });

    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();

    await page.goto(url);
    await page.setViewportSize({ width: 1440, height: 900 });

    let browserObject = storage.get(STORAGE_KEYS.BROWSER_STORAGE_KEY);
    if (!browserObject) {
      browserObject = {};
    }

    browserObject[url] = { browser, page };
    storage.set(STORAGE_KEYS.BROWSER_STORAGE_KEY, browserObject);

    return { browser, page };
  }

  static getLinkToDownloadsFolder(domain: string, url: string): string {
    return `./Downloads/${domain}/${new URL(url).host}`;
  }
}
