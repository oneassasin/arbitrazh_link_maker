import config from '../config';
import { URLS } from '../constants/urls.constants';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { FtpHostingHandler } from '../base/ftp.hosting-handler';
import { FtpClientAccessOptionsStructure } from '../structures/ftp-client-access-options.structure';
import { EUsedClient } from '../structures/used-ftp-client.enum';

export class BegetHostingHandler extends FtpHostingHandler {
  protected getUrl(): string {
    return URLS.BEGET_URL;
  }

  formatDestinationPathForDomain(): string {
    const domain = this.storage.get(STORAGE_KEYS.DOMAIN_KEY);
    return `/${domain}/public_html`;
  }

  async getDnsServers(): Promise<string[]> {
    return [
      'ns1.beget.com',
      'ns2.beget.com',
      'ns1.beget.pro',
      'ns2.beget.pro'
    ];
  }

  protected async getFtpAccessOptions(): Promise<FtpClientAccessOptionsStructure> {
    return {
      host: `${config.BEGET_USER}.beget.tech`,
      username: config.BEGET_USER,
      password: config.BEGET_PASSWORD,
      port: 21,
    };
  }

  protected getUsedFtpClient(): EUsedClient {
    return EUsedClient.FTP;
  }
}
