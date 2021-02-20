import { STORAGE_KEYS } from './constants/storage-keys.constants';
import { FileItemStructure } from './structures/file-item.structure';
import { BaseAction } from './base/base.action';
import { BaseHostingHandler } from './base/base.hosting-handler';
import { BaseInitiallyObject } from './base/base.initially-object';
import * as path from 'path';
import { Browser, Page } from 'puppeteer';
import { BaseStepExecutionReporter } from './base/base.step-execution-reporter';
import { FsUtil } from './utils/fs.util';

const REGISTER_DOMAIN_STEP_NAME = 'register_domain';
const DEFAULT_FILES_KEY = 'files';

export class Executor extends BaseInitiallyObject {
  constructor(private storage: Map<string, any>,
              private actions: BaseAction[],
              private stepExecutionReporter: BaseStepExecutionReporter,
              private hostingHandler: BaseHostingHandler,
              private uploadFiles: { url?: string; optionalUrl?: boolean, fileName: string, }[],
              private afterCompleteActions: BaseAction[] = []) {
    super();
  }

  async init() {
    await this.stepExecutionReporter.init();

    await this.handleActionsAsSteps(this.actions);

    for (const action of this.actions) {
      await this.handleAction(action);
    }

    await this.hostingHandler.init();

    const isNeedToRegisterDomain = this.storage.get(STORAGE_KEYS.IS_NEED_TO_REGISTER_DOMAIN_KEY);
    const isNeedToRegisterDomainStepComplete =
      await this.stepExecutionReporter.isStepCompleted(REGISTER_DOMAIN_STEP_NAME);

    if (isNeedToRegisterDomain && !isNeedToRegisterDomainStepComplete) {
      await this.hostingHandler.registerDomain();
    }

    const filesObject = this.storage.get(STORAGE_KEYS.FILES_KEY);

    for (const uploadFile of this.uploadFiles) {
      let destinationPath = this.hostingHandler.formatDestinationPathForDomain();

      if (uploadFile.fileName.includes('black')) {
        destinationPath += '/__page__';
      }

      const fileItemStructures: FileItemStructure[] = this.getFileStructuresFromFilesObject(filesObject, uploadFile.url);
      const fileItemStructure = fileItemStructures.find(value => value.name === uploadFile.fileName);

      await this.hostingHandler.uploadFile(destinationPath, fileItemStructure);
    }

    await this.handleActionsAsSteps(this.afterCompleteActions);

    for (const action of this.afterCompleteActions) {
      await this.handleAction(action);
    }

    await this.clearFolders();

    await this.stepExecutionReporter.clearData();

    await this.clearPuppeteerInstances();
  }

  private getFileStructuresFromFilesObject(filesObject: any, keyString: string): Array<FileItemStructure> {
    const keys = [keyString, DEFAULT_FILES_KEY].filter(key => !!filesObject[key]);
    if (!keys.length) {
      return;
    }

    return filesObject[keys[0]];
  }

  private async handleAction(action: BaseAction) {
    const actionName = (action as any).constructor.name;
    const isStepComplete = await this.stepExecutionReporter.isStepCompleted(actionName);

    await action.init();

    if (!isStepComplete && !action.isPersistAction()) {
      await action.doAction();
    }

    if (isStepComplete && action.isPersistAction()) {
      await action.doPersistAction();
      await this.stepExecutionReporter.completeStep(actionName);
    }
  }

  private async handleActionsAsSteps(actions: BaseAction[]) {
    const actionSteps = actions.filter(action => action.isPersistAction()).map((action: any) => action.constructor.name);

    for (const actionStep of actionSteps) {
      const isStepComplete = await this.stepExecutionReporter.isStepCompleted(actionStep);
      if (isStepComplete) {
        continue;
      }

      await this.stepExecutionReporter.saveStep(actionStep);
    }
  }

  private async clearFolders() {
    const domain = this.storage.get(STORAGE_KEYS.DOMAIN_KEY);
    await FsUtil.removeFolder(`${path.join(process.cwd())}/Downloads/${domain}`);
  }

  private async clearPuppeteerInstances() {
    // Метод ЗАКРЫТИЯ всех puppeteer по окончанию создания ссылки, чтобы скрипт закрывался
    const puppeteerObject = this.storage.get(STORAGE_KEYS.PUPPETEER_STORAGE_KEY);
    if (!puppeteerObject) {
      return;
    }

    for (const url of Object.keys(puppeteerObject)) {
      const browserStructure: { browser: Browser, page: Page } = puppeteerObject[url];
      try {
        await browserStructure.browser.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}
