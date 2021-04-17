import { URLS } from '../constants/urls.constants';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { HttpHostingHandler } from '../base/http.hosting-handler';
import { EUsedClient } from '../structures/used-ftp-client.enum';
import { FtpClientAccessOptionsStructure } from '../structures/ftp-client-access-options.structure';

export class DigitalOceanHostingHandler extends HttpHostingHandler {
  private dropletIp: string = null;

  protected getUrl(): string {
    return URLS.API_DIGITALOCEAN_URL;
  }

  formatDestinationPathForDomain(): string {
    return `/var/www/html`;
  }

  async getDnsServers(): Promise<string[]> {
    return [
      'ns1.digitalocean.com',
      'ns2.digitalocean.com',
      'ns3.digitalocean.com',
    ];
  }

  async init() {
    await super.init();
    const domain = this.storage.get(STORAGE_KEYS.DOMAIN_KEY);

    const getSshKeysResponse = await this.httpClient.get('account/keys');
    const sshKeyId = getSshKeysResponse.data.ssh_keys[0].id;

    await this.httpClient.post('droplets', {
      name: domain,
      region: 'sfo3',
      size: 's-1vcpu-1gb',
      image: 'lamp-20-04',
      ssh_keys: [sshKeyId]
    });

    const getDropletsResponse = await this.httpClient.get('droplets');
    const dropletObject = getDropletsResponse.data.droplets.find(droplet => droplet.name === domain);

    this.dropletIp = dropletObject.networks['v4'][0].ip_address;

    await this.httpClient.post('domains', {
      name: domain,
      ip_address: this.dropletIp,
    });
  }

  protected async getFtpAccessOptions(): Promise<FtpClientAccessOptionsStructure> {
    const ip = this.storage.get(STORAGE_KEYS.IP_KEY);

    const domain = this.storage.get(STORAGE_KEYS.DOMAIN_KEY);

    let host: string;
    if (this.dropletIp) {
      host = this.dropletIp;
    } else if (ip) {
      host = ip;
    } else {
      host = domain;
    }

    return {
      host,
      username: 'root',
      password: 'ab7d85314f9a7df83f6e0cb02884269d17a88f8ede74d386',
      port: 22,
    };
  }

  protected getUsedFtpClient(): EUsedClient {
    return EUsedClient.SSH;
  }
}
