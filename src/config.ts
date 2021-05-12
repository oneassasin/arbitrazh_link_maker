import * as process from 'process';

interface IConfig {
  ENV: string;

  JINO_USER: string;
  JINO_PASSWORD: string;

  BEGET_USER: string;
  BEGET_PASSWORD: string;

  NAMECHEAP_USER: string;
  NAMECHEAP_PASSWORD: string;

  AD_RED_RU_TOKEN: string;

  DIGITALOCEAN_TOKEN: string;

  HIDE_CLICK_TOKEN: string;

  KEITARO_API_URL: string;
  KEITARO_API_TOKEN: string;

  IS_HEADLESS_CHROME: boolean;
}

const config = {
  DEV: {
    ENV: 'DEV',

    JINO_USER: '',
    JINO_PASSWORD: '',

    BEGET_USER: '',
    BEGET_PASSWORD: '',

    AD_RED_RU_TOKEN: '',

    NAMECHEAP_USER: '',
    NAMECHEAP_PASSWORD: '',

    DIGITALOCEAN_TOKEN: '',

    HIDE_CLICK_TOKEN: '',

    KEITARO_API_TOKEN: '',
    KEITARO_API_URL: '',
  },
  GLOBAL: {
    IS_HEADLESS_CHROME: false,
  },
};

export default Object.assign(config[process.env.NODE_ENV || 'DEV'], config.GLOBAL) as IConfig;
