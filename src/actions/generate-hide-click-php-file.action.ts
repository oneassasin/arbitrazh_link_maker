import { URLS } from '../constants/urls.constants';
import config from '../config';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { FsUtil } from '../utils/fs.util';
import { HttpAction } from '../base/http.action';
import { Cookie } from 'tough-cookie';
import FormData = require('form-data');
import { BrowserUtil } from '../utils/browser.util';

export class GenerateHideClickPhpFileAction extends HttpAction {
  protected getUrl(): string {
    return URLS.HIDE_CLICK_URL;
  }

  async init() {
    await super.init();
    const cookie = new Cookie({
      key: 'api',
      value: config.HIDE_CLICK_TOKEN,
    });
    await this.cookieJar.setCookie(cookie, URLS.HIDE_CLICK_URL);
  }

  async doAction() {
    const domain: string = await this.storage.get(STORAGE_KEYS.DOMAIN_KEY);

    const bodyFormData = new FormData();
    bodyFormData.append('WHITE_PAGE', `https://${domain}/index.html`);
    bodyFormData.append('OFFER_PAGE', `https://${domain}/__page__`);
    bodyFormData.append('ALLOW_GEO', 'UA');
    bodyFormData.append('BLOCK_GEO', '');
    bodyFormData.append('UTM', 'on');
    bodyFormData.append('allow_utm_must', '');
    bodyFormData.append('allow_utm_opt', '');
    bodyFormData.append('block_utm', '');
    bodyFormData.append('WHITE_METHOD', 'curl');
    bodyFormData.append('OFFER_METHOD', 'iframe');
    bodyFormData.append('WHITE_REF', '');
    bodyFormData.append('BLOCK_APPLE', 'on');
    bodyFormData.append('BLOCK_ANDROID', 'on');
    bodyFormData.append('BLOCK_WIN', 'on');
    bodyFormData.append('BLOCK_MOBILE', 'on');
    bodyFormData.append('BLOCK_DESCTOP', 'on');
    bodyFormData.append('DELAY_START', '0');
    bodyFormData.append('act', 'download');

    const response = await this.httpClient.post(
      'download.php',
      bodyFormData,
      {
        headers: bodyFormData.getHeaders(),
        withCredentials: true,
      },
    );

    // TODO: Add checking for API token

    const basePath = BrowserUtil.getLinkToDownloadsFolder(domain, this.getUrl());
    await FsUtil.saveBufferToPath(`${basePath}/index.php`, response.data);
  }

  async doPersistAction() {
    const domain = this.storage.get(STORAGE_KEYS.DOMAIN_KEY);
    const basePath = BrowserUtil.getLinkToDownloadsFolder(domain, this.getUrl());

    const fileNames = await FsUtil.findFilesByGlob(`${basePath}/index.php`);
    const filePathName = fileNames[0];

    let buffer = await FsUtil.readFileAsStringFromPath(filePathName);

    buffer = buffer
      .replace("['DEBUG_MODE'] = 'on'", "['DEBUG_MODE'] = 'off'")
      .replace("['STEALTH'] = 'off'", "['STEALTH'] = 'on'");

    this.saveFile('index.php', Buffer.from(buffer), this.getUrl());
  }
}
