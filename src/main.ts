import { URLS } from './constants/urls.constants';
import { Executor } from './executor';
import { HostingHandlerFactory } from './hosting-handlers/hosting-handler.factory';
import { STORAGE_KEYS } from './constants/storage-keys.constants';
import { StorageUtil } from './utils/storage.util';
import { FsStepExecutionReporter } from './step-execution-reports/fs.step-execution-reporter';
import { ActionsGenerateUtil } from './utils/actions-generate.util';
import { DomainRegisterFactory } from './domain-registers/domain-register.factory';

async function main() {
  const storage = StorageUtil.parseArgsToStorage();

  const domainRegister = DomainRegisterFactory.getDomainRegister(storage);

  const hostingHandler = HostingHandlerFactory.getHostingHandler(storage);

  const actions = ActionsGenerateUtil.generateActionsFromStorage(storage);

  // TODO: Сделать генерирование прелендингов на canva.com как отдельный action

  const executor = new Executor(
    storage,
    actions,
    new FsStepExecutionReporter(storage),
    domainRegister,
    hostingHandler,
    [
      { fileName: 'black.zip' },
      { url: URLS.PL_AD_RED_URL, fileName: 'white.zip' },
      { url: URLS.HIDE_CLICK_URL, fileName: 'index.php' },
    ],
    [],
  );

  await executor.init();

  const domain: string = storage.get(STORAGE_KEYS.DOMAIN_KEY);

  // TODO: Каждая созданная ссылка (например, для домена или преленда) должна сохранять в какой-то массив в storage информацию в порядке создания
  // По окончанию создания ссылки сделать вывод в консоль последней ссылки
  console.log(`Link: https://${domain}/index.php`);

  process.exit();
}

main().catch(console.error);
