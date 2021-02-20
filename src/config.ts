import * as process from 'process';

interface IConfig {
  ENV: string;

  JINO_USER: string;
  JINO_PASSWORD: string;

  BEGET_USER: string;
  BEGET_PASSWORD: string;

  AD_RED_RU_USER: string;
  AD_RED_RU_PASSWORD: string;

  HIDE_CLICK_TOKEN: string;

  IS_HEADLESS_CHROME: boolean;
}

const config = {
  DEV: {
    ENV: 'DEV',

    JINO_USER: '',
    JINO_PASSWORD: '',

    BEGET_USER: '',
    BEGET_PASSWORD: '',

    AD_RED_RU_USER: '',
    AD_RED_RU_PASSWORD: '',

    HIDE_CLICK_TOKEN: '',
  },
  GLOBAL: {
    IS_HEADLESS_CHROME: false,
  },
};

export default Object.assign(config[process.env.NODE_ENV || 'DEV'], config.GLOBAL) as IConfig;
