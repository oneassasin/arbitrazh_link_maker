import { FileAction } from '../base/file.action';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { FsUtil } from '../utils/fs.util';

export class ReadBlackPageAction extends FileAction {
  async doAction() {
    const path = this.storage.get(STORAGE_KEYS.BLACK_PAGE_PATH);
    const buffer = await FsUtil.readFileFromPath(path);

    this.saveFile('black.zip', buffer);
  }

  isPersistAction(): boolean {
    return false;
  }
}
