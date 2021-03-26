import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { ConnectOptions } from 'ssh2-sftp-client';
import * as Client from 'ssh2-sftp-client';

export class FtpUtil {
  static async makeNewInstance(storage: Map<string, any>, accessOptions: ConnectOptions): Promise<Client> {
    const client = new Client();

    accessOptions.retries = 5;
    accessOptions.debug = (msg: string) => {
      console.debug(msg);
    };

    await client.connect(accessOptions);

    let ftpObject = storage.get(STORAGE_KEYS.FTP_KEY);
    if (!ftpObject) {
      ftpObject = {};
    }

    ftpObject[accessOptions.host] = { client };
    storage.set(STORAGE_KEYS.FTP_KEY, ftpObject);

    return client;
  }
}
