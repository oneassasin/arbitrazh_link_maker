import { BaseHostingHandler } from './base.hosting-handler';
import { FtpUtil } from '../utils/ftp.util';
import { Readable } from 'stream';
import { EFileItemType, FileItemStructure } from '../structures/file-item.structure';
import * as AdmZip from 'adm-zip';
import { FtpClientAccessOptionsStructure } from '../structures/ftp-client-access-options.structure';
import { FtpClientStructure } from '../structures/ftp-client.structure';
import { FtpFileInfoStructure } from '../structures/ftp-file-info.structure';
import { Buffer } from 'buffer';
import { EUsedClient } from '../structures/used-ftp-client.enum';

export abstract class FtpHostingHandler extends BaseHostingHandler {
  protected ftpClient: FtpClientStructure;

  async init() {
  }

  async uploadFile(destinationUrl: string, fileItemStructure: FileItemStructure) {
    if (!this.ftpClient) {
      await this.ftpInit();
    }

    let readable: Readable | Buffer | string;

    switch (fileItemStructure.type) {
      case EFileItemType.Zip: {
        const zipArchive = fileItemStructure.value as AdmZip;

        const entries = zipArchive.getEntries();

        for (const entry of entries) {
          if (entry.isDirectory) {
            await this.ftpClient.mkdir(`${destinationUrl}/${entry.entryName}`);

            continue;
          }

          let remoteFilePath = destinationUrl;

          if (entry.entryName.split('/').length > 1) {
            const foldersArray = entry.entryName.split('/');

            for (let index = 0; index < foldersArray.length; ++index) {
              remoteFilePath += `/${foldersArray[index]}`;

              if (index + 1 === foldersArray.length) {
                break;
              }

              const isFolderExists = await this.ftpClient.exists(remoteFilePath);
              if (isFolderExists) {
                continue;
              }

              await this.ftpClient.mkdir(remoteFilePath);
            }
          } else {
            remoteFilePath += `/${entry.entryName}`;
          }

          readable = await new Promise<Buffer>(resolve => entry.getDataAsync(resolve));

          await this.ftpClient.put(
            readable,
            remoteFilePath,
          );
        }

        return;
      }
      case EFileItemType.Buffer: {
        readable = Buffer.from(fileItemStructure.value);
        break;
      }
      case EFileItemType.String: {
        readable = Buffer.from(fileItemStructure.value);
        break;
      }
    }

    await this.ftpClient.put(readable, `${destinationUrl}/${fileItemStructure.name}`);
  }

  private async ftpInit() {
    const accessOptions = await this.getFtpAccessOptions();
    const usedClient = this.getUsedFtpClient();

    this.ftpClient = await FtpUtil.makeNewInstance(this.storage, accessOptions, usedClient);

    if (this.isNeedToClearDomainFolder()) {
      const filesList: FtpFileInfoStructure[] = await this.ftpClient.list(this.formatDestinationPathForDomain());
      for (const file of filesList) {
        try {
          await this.ftpClient.rmdir(`${this.formatDestinationPathForDomain()}/${file.name}`, true);
        } catch {
        }
        try {
          await this.ftpClient.delete(`${this.formatDestinationPathForDomain()}/${file.name}`);
        } catch {
        }
      }
    }

    await this.ftpClient.mkdir(`${this.formatDestinationPathForDomain()}/__page__`);
  }

  protected isNeedToClearDomainFolder(): boolean {
    return true;
  }

  protected abstract async getFtpAccessOptions(): Promise<FtpClientAccessOptionsStructure>;

  protected abstract getUsedFtpClient(): EUsedClient;
}
