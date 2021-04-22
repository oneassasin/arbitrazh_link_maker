import * as yargs from 'yargs';
import * as path from 'path';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { StringsUtil } from './strings.util';

const WHITE_PAGE_LANGUAGE_CHOICES = [
  'ru', 'en', 'ga', 'it', 'de', 'bg', 'hu', 'es', 'pt', 'el', 'da', 'lv', 'lt', 'mt', 'nl', 'pl', 'ro', 'sk', 'sl', 'fi', 'fr', 'hr', 'cs', 'sv', 'et', 'id', 'kk', 'sq', 'vi', 'ja', 'zh', 'th', 'ko', 'ar'
];

const WHITE_PAGE_THEMATIC_CHOICES = [
  'oil_ai', 'psychology_ai', 'health_and_beauty_ai', 'gifts_ai', 'varicose_ai', 'mans_health_ai', 'marketing_ai', 'fitnes_ai', 'finance_ai', 'aligadgety_ai', 'apartment_ai', 'geology_ai', 'joints_ai', 'agrobiologia_ai'
];

export class StorageUtil {
  static parseArgsToStorage(): Map<string, any> {
    const storage = new Map<string, any>();

    const argv = yargs(process.argv.slice(2))
      .options({
        random_domain: { alias: ['random-domain'], type: 'boolean', default: false },
        domain: { type: 'string', default: '' },
        disable_domain_register: { alias: ['disable-domain-register'], type: 'boolean', default: false },

        language: { type: 'string', choices: WHITE_PAGE_LANGUAGE_CHOICES, default: WHITE_PAGE_LANGUAGE_CHOICES[0] },
        thematic: { type: 'string', choices: WHITE_PAGE_THEMATIC_CHOICES, default: WHITE_PAGE_THEMATIC_CHOICES[0] },

        hosting: { choices: ['beget', 'jino', 'digitalocean'], default: 'jino' },
        domain_register: { alias: ['domain-register'], type: 'string', choices: ['beget', 'jino', 'namecheap'], default: 'jino' },

        cloak: { choices: ['hideclick'], default: 'hideclick' },

        ip: { type: 'string', demandOption: false },

        black_page_path: { alias: ['black-page-path'], type: 'string', demandOption: true, coerce: str => path.resolve(str) },
        white_page_path: { alias: ['white-page-path'], type: 'string', demandOption: false, coerce: str => path.resolve(str) }
      })
      .argv;

    if (argv.random_domain) {
      storage.set(STORAGE_KEYS.DOMAIN_KEY, `${StringsUtil.generateRandomString()}.com`);
    } else if (argv.domain) {
      storage.set(STORAGE_KEYS.DOMAIN_KEY, argv.domain);
    } else {
      throw new Error('You must use random generated domain or provide name of domain');
    }

    storage.set(STORAGE_KEYS.IP_KEY, argv.ip);

    storage.set(STORAGE_KEYS.IS_NEED_TO_REGISTER_DOMAIN_KEY, argv.disable_domain_register !== true);

    storage.set(STORAGE_KEYS.DOMAIN_REGISTER, argv.domain_register);

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
}
