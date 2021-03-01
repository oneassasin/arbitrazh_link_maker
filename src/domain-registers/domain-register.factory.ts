import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { BegetDomainRegister } from './beget.domain-register';
import { JinoDomainRegister } from './jino.domain-register';
import { NamecheapDomainRegister } from './namecheap.domain-register';
import { BaseDomainRegister } from '../base/base.domain-register';

export abstract class DomainRegisterFactory {
  static getDomainRegister(storage: Map<string, any>): BaseDomainRegister {
    switch (storage.get(STORAGE_KEYS.DOMAIN_REGISTER)) {
      case 'jino':
        return new JinoDomainRegister(storage);
      case 'beget':
        return new BegetDomainRegister(storage);
      case 'namecheap':
        return new NamecheapDomainRegister(storage);
      default:
        throw new Error('Cannot find domain register');
    }
  }
}
