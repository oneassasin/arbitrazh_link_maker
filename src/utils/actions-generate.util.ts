import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { ReadBlackPageAction } from '../actions/read-black-page.action';
import { ReadWhitePageAction } from '../actions/read-white-page.action';
import { GenerateHideClickPhpFileAction } from '../actions/generate-hide-click-php-file.action';
import { GenerateWhitePageAction } from '../actions/generate-white-page.action';
import { BaseAction } from '../base/base.action';

export class ActionsGenerateUtil {
  static generateActionsFromStorage(storage: Map<string, any>): BaseAction[] {
    const actions: BaseAction[] = [];

    actions.push(new ReadBlackPageAction(storage));

    if (storage.has(STORAGE_KEYS.WHITE_PAGE_PATH)) {
      actions.push(new ReadWhitePageAction(storage));
    } else {
      actions.push(new GenerateWhitePageAction(storage));
    }

    switch (storage.get(STORAGE_KEYS.CLOAK_KEY)) {
      case 'hideclick': {
        actions.push(new GenerateHideClickPhpFileAction(storage));
      }
    }

    return actions;
  }
}
