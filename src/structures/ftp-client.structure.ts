import * as SshClient from 'ssh2-sftp-client';
import { Client as FtpClient } from 'basic-ftp';
import { EUsedClient } from './used-ftp-client.enum';
import { Readable } from 'stream';
import { Buffer } from 'buffer';
import { FtpFileInfoStructure } from './ftp-file-info.structure';

export class FtpClientStructure {
  private readonly sshClient: SshClient;
  private readonly ftpClient: FtpClient;
  private readonly usedClient: EUsedClient;

  constructor(params: { sshClient: SshClient, ftpClient: FtpClient }) {
    if (params.sshClient) {
      this.sshClient = params.sshClient;
      this.usedClient = EUsedClient.SSH;
    } else {
      this.ftpClient = params.ftpClient;
      this.usedClient = EUsedClient.FTP;
    }
  }

  async mkdir(path: string) {
    if (this.usedClient === EUsedClient.SSH) {
      await this.sshClient.mkdir(path);
    }
    if (this.usedClient === EUsedClient.FTP) {
      await this.ftpClient.ensureDir(path);
    }
  }

  async exists(path: string): Promise<boolean> {
    if (this.usedClient === EUsedClient.SSH) {
      return await this.sshClient.exists(path) !== false;
    }
    if (this.usedClient === EUsedClient.FTP) {
      try {
        await this.ftpClient.size(path);
        return true;
      } catch {
        return false;
      }
    }
  }

  async put(readable: Readable | Buffer | string, path: string) {
    if (this.usedClient === EUsedClient.SSH) {
      await this.sshClient.put(Buffer.from(readable as any), path);
    }
    if (this.usedClient === EUsedClient.FTP) {
      let uploadReadable: string = null;
      if (Buffer.isBuffer(readable)) {
        uploadReadable = readable.toString();
      }
      if (typeof readable === 'string') {
        uploadReadable = readable;
      }
      await this.ftpClient.uploadFrom(Readable.from(uploadReadable), path);
    }
  }

  async list(path: string): Promise<FtpFileInfoStructure[]> {
    if (this.usedClient === EUsedClient.SSH) {
      const files = await this.sshClient.list(path);
      return files.map(value => ({
        name: value.name
      }));
    }
    if (this.usedClient === EUsedClient.FTP) {
      const files = await this.ftpClient.list(path);
      return files.map(value => ({
        name: value.name,
      }));
    }
  }

  async rmdir(path: string, recursive: boolean = false) {
    if (this.usedClient === EUsedClient.SSH) {
      await this.sshClient.rmdir(path, recursive);
    }
    if (this.usedClient === EUsedClient.FTP) {
      await this.ftpClient.removeDir(path);
    }
  }

  async delete(path: string) {
    if (this.usedClient === EUsedClient.SSH) {
      await this.sshClient.delete(path);
    }
    if (this.usedClient === EUsedClient.FTP) {
      await this.ftpClient.remove(path);
    }
  }
}
