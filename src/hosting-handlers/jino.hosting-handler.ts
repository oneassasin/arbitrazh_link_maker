import config from '../config';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { FtpHostingHandler } from '../base/ftp.hosting-handler';
import { FtpClientAccessOptionsStructure } from '../structures/ftp-client-access-options.structure';
import { EUsedClient } from '../structures/used-ftp-client.enum';

export class JinoHostingHandler extends FtpHostingHandler {
  formatDestinationPathForDomain(): string {
    const domain = this.storage.get(STORAGE_KEYS.DOMAIN_KEY);
    return `/${domain}`;
  }

  async getDnsServers(): Promise<string[]> {
    return [
      'ns1.jino.ru',
      'ns2.jino.ru',
      'ns3.jino.ru',
      'ns4.jino.ru'
    ];
  }

  protected async getFtpAccessOptions(): Promise<FtpClientAccessOptionsStructure> {
    return {
      host: `${config.JINO_USER}.myjino.ru`,
      username: config.JINO_USER,
      password: config.JINO_PASSWORD,
      port: 21,
    };
  }

  protected getUsedFtpClient(): EUsedClient {
    return EUsedClient.FTP;
  }
}
