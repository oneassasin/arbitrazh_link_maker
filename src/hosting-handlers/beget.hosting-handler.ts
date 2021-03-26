import { PuppeteerHostingHandler } from '../base/puppeteer.hosting-handler';
import config from '../config';
import { URLS } from '../constants/urls.constants';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { ConnectOptions } from 'ssh2-sftp-client';
import { FtpHostingHandler } from '../base/ftp.hosting-handler';

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

  protected async getFtpAccessOptions(): Promise<ConnectOptions> {
    return {
      host: `${config.BEGET_USER}.beget.tech`,
      username: config.BEGET_USER,
      password: config.BEGET_PASSWORD,
      port: 21,
    };
  }
}
