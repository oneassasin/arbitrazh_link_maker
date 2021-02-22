import * as yargs from 'yargs';
import * as path from 'path';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';

export class StorageUtil {
  static parseArgsToStorage(): Map<string, any> {
    const storage = new Map<string, any>();

    const argv = yargs(process.argv.slice(2))
      .options({
        random_domain: { type: 'boolean', default: false },
        domain: { type: 'string', default: '' },
        register_domain: { type: 'boolean', default: true },

        language: { type: 'number', default: 3 },
        thematic: { type: 'number', default: 5 },

        hosting: { choices: ['beget', 'jino'], default: 'jino' },

        cloak: { choices: ['hideclick'], default: 'hideclick' },

        black_page_path: { type: 'string', demandOption: true, coerce: str => path.resolve(str) },
        white_page_path: { type: 'string', demandOption: false, coerce: str => path.resolve(str) }
      })
      .argv;

    if (argv.random_domain) {
      storage.set(STORAGE_KEYS.DOMAIN_KEY, this.generateRandomDomain());
    } else if (argv.domain) {
      storage.set(STORAGE_KEYS.DOMAIN_KEY, argv.domain);
    } else {
      throw new Error('You must use random generated domain or provide name of domain');
    }

    storage.set(STORAGE_KEYS.IS_NEED_TO_REGISTER_DOMAIN_KEY, argv.register_domain);

    storage.set(STORAGE_KEYS.WHITE_PAGE_LANGUAGE_KEY, argv.language);
    storage.set(STORAGE_KEYS.WHITE_PAGE_THEMATIC_KEY, argv.thematic);

    storage.set(STORAGE_KEYS.HOSTING_KEY, argv.hosting);
    storage.set(STORAGE_KEYS.CLOAK_KEY, argv.cloak);

    storage.set(STORAGE_KEYS.BLACK_PAGE_PATH, argv.black_page_path);
    if (argv.white_page_path) {
      storage.set(STORAGE_KEYS.WHITE_PAGE_PATH, argv.white_page_path);
    }

    return storage;
  }

  private static generateRandomDomain(length: number = 12): string {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }
}
