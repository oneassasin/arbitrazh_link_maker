import { URLS } from './constants/urls.constants';
import { Executor } from './executor';
import { HostingHandlerFactory } from './hosting-handlers/hosting-handler.factory';
import { STORAGE_KEYS } from './constants/storage-keys.constants';
import { StorageUtil } from './utils/storage.util';
import { FsStepExecutionReporter } from './step-execution-reports/fs.step-execution-reporter';
import { ActionsGenerateUtil } from './utils/actions-generate.util';
import { DomainRegisterFactory } from './domain-registers/domain-register.factory';
import { LoggerUtil } from './utils/logger.util';

async function main() {
  const storage = StorageUtil.parseArgsToStorage();
  LoggerUtil.log('Main', 'Script started');
  const startTime = Math.round(+new Date() / 1000);

  if (storage.get(STORAGE_KEYS.IS_NEED_TO_REGISTER_DOMAIN_KEY)) {
    LoggerUtil.log('Main', 'Domain register disabled');
  } else {
    LoggerUtil.log('Main', `Domain register: ${storage.get(STORAGE_KEYS.DOMAIN_REGISTER)}`);
  }

  const domainRegister = DomainRegisterFactory.getDomainRegister(storage);

  const hostingHandler = HostingHandlerFactory.getHostingHandler(storage);

  LoggerUtil.log('Main', `Hosting handler: ${storage.get(STORAGE_KEYS.HOSTING_KEY)}`);

  const actions = ActionsGenerateUtil.generateActionsFromStorage(storage);

  // TODO: Сделать генерирование прелендингов на canva.com как отдельный action

  const executor = new Executor(
    storage,
    actions,
    new FsStepExecutionReporter(storage),
    domainRegister,
    hostingHandler,
    [
      { fileName: 'black.zip', fileDestinationPath: '__page__' },
      { url: URLS.PL_AD_RED_URL, fileName: 'white.zip' },
      { fileName: 'index.php' },
    ],
    [],
  );

  try {
    await executor.init();

    const domain: string = storage.get(STORAGE_KEYS.DOMAIN_KEY);

    // TODO: Каждая созданная ссылка (например, для домена или преленда) должна сохранять в какой-то массив в storage информацию в порядке создания
    // По окончанию создания ссылки сделать вывод в консоль последней ссылки
    LoggerUtil.log('Main', `Link: https://${domain}/index.php`);
  } catch (err) {
    LoggerUtil.log('Main', 'Link doesnt created');
    console.error(err);
  } finally {
    LoggerUtil.log('Main', `Script ended. Elapsed time: ${Math.round(+new Date() / 1000) - startTime} seconds`);
    process.exit();
  }
}

main().catch(console.error);
