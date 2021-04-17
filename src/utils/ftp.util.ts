import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import * as SSHClient from 'ssh2-sftp-client';
import { ConnectOptions as SSHConnectOptions } from 'ssh2-sftp-client';
import { AccessOptions as FtpAccessOptions, Client as FtpClient } from 'basic-ftp';
import { FtpClientStructure } from '../structures/ftp-client.structure';
import { FtpClientAccessOptionsStructure } from '../structures/ftp-client-access-options.structure';
import { EUsedClient } from '../structures/used-ftp-client.enum';

export class FtpUtil {
  static async makeNewInstance(
    storage: Map<string, any>,
    ftpClientAccessOptions: FtpClientAccessOptionsStructure,
    usedClient: EUsedClient,
  ): Promise<FtpClientStructure> {

    let client: { sshClient: SSHClient, ftpClient: FtpClient } = { sshClient: null, ftpClient: null };

    switch (usedClient) {
      case EUsedClient.FTP: {
        client.ftpClient = await this.makeNewFTPInstance(
          storage,
          {
            host: ftpClientAccessOptions.host,
            password: ftpClientAccessOptions.password,
            port: ftpClientAccessOptions.port,
            user: ftpClientAccessOptions.username,
          },
        );
        break;
      }
      case EUsedClient.SSH: {
        client.sshClient = await this.makeNewSSHInstance(
          storage,
          {
            host: ftpClientAccessOptions.host,
            password: ftpClientAccessOptions.password,
            port: ftpClientAccessOptions.port,
            username: ftpClientAccessOptions.username,
          },
        );
        break;
      }
    }

    return new FtpClientStructure(client);
  }

  private static async makeNewSSHInstance(storage: Map<string, any>, accessOptions: SSHConnectOptions): Promise<SSHClient> {
    const client = new SSHClient();

    accessOptions.retries = 5;
    accessOptions.debug = (msg: string) => {
      console.debug(msg);
    };

    await client.connect(accessOptions);

    this.setFtpClient(storage, accessOptions.host, client);

    return client;
  }

  private static async makeNewFTPInstance(storage: Map<string, any>, accessOptions: FtpAccessOptions): Promise<FtpClient> {
    const client = new FtpClient();

    await client.access(accessOptions);

    this.setFtpClient(storage, accessOptions.host, client);

    return client;
  }

  private static setFtpClient(storage: Map<string, any>, host: string, client: FtpClient | SSHClient) {
    let ftpObject = storage.get(STORAGE_KEYS.FTP_KEY);
    if (!ftpObject) {
      ftpObject = {};
    }

    ftpObject[host] = { client };
    storage.set(STORAGE_KEYS.FTP_KEY, ftpObject);
  }
}
