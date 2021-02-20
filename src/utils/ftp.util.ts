import { AccessOptions, Client } from 'basic-ftp';

export class FtpUtil {
  static async makeNewInstance(accessOptions: AccessOptions): Promise<Client> {
    const client = new Client();

    await client.access(accessOptions);

    return client;
  }
}
