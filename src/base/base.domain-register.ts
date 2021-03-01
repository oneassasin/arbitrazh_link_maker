import { BaseInitiallyObject } from './base.initially-object';

export abstract class BaseDomainRegister extends BaseInitiallyObject {
  abstract async registerDomain();

  abstract async setupDnsServers(dnsServers: string[]);
}
