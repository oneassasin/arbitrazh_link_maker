import { STORAGE_KEYS } from './constants/storage-keys.constants';
import { FileItemStructure } from './structures/file-item.structure';
import { BaseInitiallyObject } from './base/base.initially-object';
import * as path from 'path';
import { Browser, Page } from 'puppeteer';
import { BaseStepExecutionReporter } from './base/base.step-execution-reporter';
import { FsUtil } from './utils/fs.util';
import { BaseAction } from './base/base.action';
import { BaseDomainRegister } from './base/base.domain-register';
import { BaseHostingHandler } from './base/base.hosting-handler';
import { LoggerUtil } from './utils/logger.util';
import { UploadFileStructure } from './structures/upload-file.structure';

const REGISTER_DOMAIN_STEP_NAME = 'register_domain';
const DEFAULT_FILES_KEY = 'files';

export class Executor extends BaseInitiallyObject {
  constructor(private storage: Map<string, any>,
              private actions: BaseAction[],
              private stepExecutionReporter: BaseStepExecutionReporter,
              private domainRegister: BaseDomainRegister,
              private hostingHandler: BaseHostingHandler,
              uploadFiles: UploadFileStructure[],
              private afterCompleteActions: BaseAction[] = []) {
    super();
    this.storage.set(STORAGE_KEYS.UPLOAD_FILES_KEY, uploadFiles);
  }

  async init() {
    LoggerUtil.log('*', 'Executor: init');
    await this.stepExecutionReporter.init();

    await this.handleActionsAsSteps(this.actions);

    for (const action of this.actions) {
      await this.handleAction(action);
    }

    const isNeedToRegisterDomain = this.storage.get(STORAGE_KEYS.IS_NEED_TO_REGISTER_DOMAIN_KEY);
    const isNeedToRegisterDomainStepComplete =
      await this.stepExecutionReporter.isStepCompleted(REGISTER_DOMAIN_STEP_NAME);

    if (isNeedToRegisterDomain && !isNeedToRegisterDomainStepComplete) {
      LoggerUtil.log('*', `Domain register: ${this.storage.get(STORAGE_KEYS.DOMAIN_REGISTER)}`);
      LoggerUtil.log('*', 'Domain register: init');
      await this.domainRegister.init();
    }

    LoggerUtil.log('*', `Hosting handler: ${this.storage.get(STORAGE_KEYS.HOSTING_KEY)}`);
    LoggerUtil.log('*', 'Hosting handler: init');
    await this.hostingHandler.init();

    if (isNeedToRegisterDomain && !isNeedToRegisterDomainStepComplete) {
      LoggerUtil.log('*', 'Hosting handler: register domain');
      await this.domainRegister.registerDomain();

      const domainRegisterName = this.storage.get(STORAGE_KEYS.DOMAIN_REGISTER);
      const hostingHandlerName = this.storage.get(STORAGE_KEYS.HOSTING_KEY);

      if (domainRegisterName !== hostingHandlerName) {
        const dnsServers = await this.hostingHandler.getDnsServers();
        LoggerUtil.log('*', 'Hosting handler: setup dns servers');
        await this.domainRegister.setupDnsServers(dnsServers);
      }
    }

    const filesObject = this.storage.get(STORAGE_KEYS.FILES_KEY);

    const uploadFiles: UploadFileStructure[] = this.storage.get(STORAGE_KEYS.UPLOAD_FILES_KEY);
    for (const uploadFile of uploadFiles) {
      let destinationPath = this.hostingHandler.formatDestinationPathForDomain();

      if (uploadFile.fileDestinationPath) {
        destinationPath += `/${uploadFile.fileDestinationPath}`;
      }

      const fileItemStructures: FileItemStructure[] = this.getFileStructuresFromFilesObject(filesObject, uploadFile.url);
      const fileItemStructure = fileItemStructures.find(value => value.name === uploadFile.fileName);

      LoggerUtil.log('*', `Hosting handler: upload ${fileItemStructure.name} to ${destinationPath}`);

      await this.hostingHandler.uploadFile(destinationPath, fileItemStructure);
    }

    await this.handleActionsAsSteps(this.afterCompleteActions);

    for (const action of this.afterCompleteActions) {
      await this.handleAction(action);
    }

    LoggerUtil.log('*', 'Executor: cleaning');

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

    if (!isStepComplete) {
      LoggerUtil.log('*', `${actionName}: Execute action`);

      await action.doAction();
    }

    if (action.isPersistAction()) {
      LoggerUtil.log('*', `${actionName}: Execute persist action`);

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
