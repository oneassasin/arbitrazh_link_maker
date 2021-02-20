import { BaseInitiallyObject } from './base.initially-object';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';

export abstract class BaseStepExecutionReporter extends BaseInitiallyObject {
  constructor(protected storage: Map<string, any>) {
    super();
  }

  async init() {
  }

  async saveStep(step: string) {
    await this.saveItem(this.storage.get(STORAGE_KEYS.DOMAIN_KEY), step);
  }

  async completeStep(step: string) {
    await this.saveItem(this.storage.get(STORAGE_KEYS.DOMAIN_KEY), step);
  }

  async isStepCompleted(step: string): Promise<boolean> {
    const isStepComplete = await this.readItem(this.storage.get(STORAGE_KEYS.DOMAIN_KEY), step);

    return isStepComplete === '1';
  }

  abstract async clearData();

  protected abstract async saveItem(domain: string, data: string);

  protected abstract async readItem(domain: string, key: string): Promise<string>;
}
