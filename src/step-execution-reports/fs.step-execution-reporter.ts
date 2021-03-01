import { BaseStepExecutionReporter } from '../base/base.step-execution-reporter';
import { FsUtil } from '../utils/fs.util';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';

const FOLDER_NAME = 'steps';

export class FsStepExecutionReporter extends BaseStepExecutionReporter {
  async init() {
    await super.init();

    const isFolderExists = await FsUtil.isPathExists(FOLDER_NAME);
    if (!isFolderExists) {
      await FsUtil.createFolder(FOLDER_NAME);
    }
  }

  protected async readItem(domain: string, key: string): Promise<string> {
    const isFolderExists = await FsUtil.isPathExists(`${FOLDER_NAME}/${domain}`);
    if (!isFolderExists) {
      await FsUtil.createFolder(`${FOLDER_NAME}/${domain}`);
    }

    const isPathExists = await FsUtil.isPathExists(`${FOLDER_NAME}/${domain}/${key}`);
    if (!isPathExists) {
      return '0';
    }

    const buffer = await FsUtil.readFileFromPath(`${FOLDER_NAME}/${domain}/${key}`);
    return buffer.toString('utf-8').replace('\n', '');
  }

  protected async saveItem(domain: string, key: string, data: string) {
    await this.checkExistOfSubDir(domain);
    await FsUtil.saveFileToPath(`${FOLDER_NAME}/${domain}/${key}`, data);
  }

  async clearData() {
    await FsUtil.removeFolder(`${FOLDER_NAME}/${this.storage.get(STORAGE_KEYS.DOMAIN_KEY)}`);
  }

  private async checkExistOfSubDir(key: string) {
    const folderPath = `${FOLDER_NAME}/${key}`;
    const isDirectoryExists = await FsUtil.isPathExists(folderPath);
    if (isDirectoryExists) {
      return;
    }

    await FsUtil.createFolder(folderPath);
  }
}
