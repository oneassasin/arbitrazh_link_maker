import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { JinoHostingHandler } from './jino.hosting-handler';
import { BegetHostingHandler } from './beget.hosting-handler';
import { DigitalOceanHostingHandler } from './digitalocean.hosting-handler';
import { BaseHostingHandler } from '../base/base.hosting-handler';

export abstract class HostingHandlerFactory {
  static getHostingHandler(storage: Map<string, any>): BaseHostingHandler {
    switch (storage.get(STORAGE_KEYS.HOSTING_KEY)) {
      case 'jino':
        return new JinoHostingHandler(storage);
      case 'beget':
        return new BegetHostingHandler(storage);
      case 'digitalocean':
        return new DigitalOceanHostingHandler(storage);
      default:
        throw new Error('Cannot find hosting handler');
    }
  }
}
