import { BaseInitiallyObject } from './base.initially-object';

export abstract class BaseAction extends BaseInitiallyObject {
  constructor(protected storage: Map<string, any>) {
    super();
  }

  async doAction() {
  }

  async doPersistAction() {
  }

  isPersistAction(): boolean {
    return true;
  }
}
