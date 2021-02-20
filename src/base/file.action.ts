import { BaseAction } from './base.action';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { EFileItemType, FileItemStructure } from '../structures/file-item.structure';
import * as AdmZip from 'adm-zip';

export abstract class FileAction extends BaseAction {
  async init() {
    await this.onInit();
  }

  protected async onInit() {
  }

  protected saveFile(name: string, buffer: Buffer, destination: string = 'files') {
    let filesObject = this.storage.get(STORAGE_KEYS.FILES_KEY);
    if (!filesObject) {
      filesObject = {};
      this.storage.set(STORAGE_KEYS.FILES_KEY, filesObject);
    }

    if (!filesObject[destination]) {
      filesObject[destination] = [];
    }

    const words = name.split('.');
    const fileType = words[words.length - 1];

    if (fileType === 'zip') {
      const zipArchive = new AdmZip(buffer);
      filesObject[destination].push(new FileItemStructure(EFileItemType.Zip, name, zipArchive));
    } else {
      filesObject[destination].push(new FileItemStructure(EFileItemType.Buffer, name, buffer));
    }
  }
}
