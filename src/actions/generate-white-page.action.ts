import { URLS } from '../constants/urls.constants';
import { FsUtil } from '../utils/fs.util';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { HttpAction } from '../base/http.action';
import config from '../config';
import { ZipFileUtil } from '../utils/zip-file.util';
import { BrowserUtil } from '../utils/browser.util';

export class GenerateWhitePageAction extends HttpAction {
  protected getUrl(): string {
    return URLS.PL_AD_RED_URL;
  }

  async doAction() {
    const languageItem = this.storage.get(STORAGE_KEYS.WHITE_PAGE_LANGUAGE_KEY);
    const thematicItem = this.storage.get(STORAGE_KEYS.WHITE_PAGE_THEMATIC_KEY);

    const domain = this.storage.get(STORAGE_KEYS.DOMAIN_KEY);

    const response = await this.httpClient.get('generate', {
      params: {
        language: languageItem,
        theme: thematicItem,
        api_key: config.AD_RED_RU_TOKEN,
      },
    });

    const hash = response.data.message.hash;

    console.log(`Hash of white page ${hash}`);

    const downloadResponse = await this.httpClient.get('download', {
      params: {
        hash,
        api_key: config.AD_RED_RU_TOKEN,
      },
      responseType: 'arraybuffer',
    });

    const archiveData = downloadResponse.data;

    const basePath = BrowserUtil.getLinkToDownloadsFolder(domain, this.getUrl());
    await FsUtil.saveBufferToPath(`${basePath}/${hash}.zip`, archiveData);
  }

  async doPersistAction() {
    const domain = this.storage.get(STORAGE_KEYS.DOMAIN_KEY);
    const basePath = BrowserUtil.getLinkToDownloadsFolder(domain, this.getUrl());

    const fileNames = await FsUtil.findFilesByGlob(`${basePath}/*.zip`);
    const filePathName = fileNames[0];

    const buffer = await FsUtil.readFileFromPath(filePathName);

    const newArchiveBuffer = await ZipFileUtil.convertWhitePageZipArchive(buffer);

    this.saveFile('white.zip', newArchiveBuffer);
  }
}
