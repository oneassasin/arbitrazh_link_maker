import { FileAction } from '../base/file.action';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { FsUtil } from '../utils/fs.util';
import * as AdmZip from 'adm-zip';

export class ReadWhitePageAction extends FileAction {
  async doAction() {
    const path = this.storage.get(STORAGE_KEYS.WHITE_PAGE_PATH);
    const buffer = await FsUtil.readFileFromPath(path);

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

  isPersistAction(): boolean {
    return false;
  }
}
