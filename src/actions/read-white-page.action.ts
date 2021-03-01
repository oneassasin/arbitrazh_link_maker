import { FileAction } from '../base/file.action';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { FsUtil } from '../utils/fs.util';
import { ZipFileUtil } from '../utils/zip-file.util';

export class ReadWhitePageAction extends FileAction {
  async doAction() {
    const path = this.storage.get(STORAGE_KEYS.WHITE_PAGE_PATH);
    const buffer = await FsUtil.readFileFromPath(path);

    const newArchiveBuffer = await ZipFileUtil.convertWhitePageZipArchive(buffer);

    this.saveFile('white.zip', newArchiveBuffer);
  }

  isPersistAction(): boolean {
    return false;
  }
}
