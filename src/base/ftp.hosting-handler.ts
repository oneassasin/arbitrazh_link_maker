import { BaseHostingHandler } from './base.hosting-handler';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { AccessOptions, Client, FileInfo } from 'basic-ftp';
import { FtpUtil } from '../utils/ftp.util';
import { Readable } from 'stream';
import { EFileItemType, FileItemStructure } from '../structures/file-item.structure';
import * as AdmZip from 'adm-zip';

export abstract class FtpHostingHandler extends BaseHostingHandler {
  protected ftpClient: Client;

  async init() {
    const accessOptions = this.getFtpAccessOptions();
    const ftpHost = accessOptions.host;

    this.ftpClient = await FtpUtil.makeNewInstance(accessOptions);

    let ftpObject = await this.storage.get(STORAGE_KEYS.FTP_KEY);
    if (!ftpObject) {
      ftpObject = {};
    }

    ftpObject[ftpHost] = this.ftpClient;
    await this.storage.set(STORAGE_KEYS.FTP_KEY, ftpObject);

    if (this.isNeedToClearDomainFolder()) {
      await this.ftpClient.ensureDir(this.formatDestinationPathForDomain());

      let filesList: FileInfo[] = await this.ftpClient.list();
      while (filesList.length !== 0) {
        try {
          await this.ftpClient.clearWorkingDir()
          filesList = await this.ftpClient.list();
        } catch (err) {
          console.error(err);
        }
      }
    }

    await this.onInit();
  }

  async uploadFile(destinationUrl: string, fileItemStructure: FileItemStructure) {
    let readable: Readable | string;

    switch (fileItemStructure.type) {
      case EFileItemType.Zip: {
        const zipArchive = fileItemStructure.value as AdmZip;

        for (const entry of zipArchive.getEntries()) {
          if (entry.isDirectory) {
            await this.ftpClient.ensureDir(`${destinationUrl}/${entry.entryName}`);
            await this.ftpClient.cd('..');

            continue;
          }

          const data: Buffer = await new Promise<Buffer>(resolve => entry.getDataAsync(resolve));
          readable = Readable.from(data.toString());
          await this.ftpClient.uploadFrom(readable, `${destinationUrl}/${entry.entryName}`);
        }

        return;
      }
      case EFileItemType.Buffer: {
        readable = Readable.from(fileItemStructure.value.toString());
        break;
      }
      case EFileItemType.String: {
        readable = fileItemStructure.value as string;
        break;
      }
    }

    await this.ftpClient.uploadFrom(readable, `${destinationUrl}/${fileItemStructure.name}`);
  }

  protected async onInit() {
  }

  protected isNeedToClearDomainFolder(): boolean {
    return true;
  }

  protected abstract getFtpAccessOptions(): AccessOptions;
}
