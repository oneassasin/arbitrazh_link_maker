import { FileItemStructure } from '../structures/file-item.structure';
import { BaseInitiallyObject } from './base.initially-object';

export abstract class BaseHostingHandler extends BaseInitiallyObject {
  constructor(protected storage: Map<string, any>) {
    super();
  }

  abstract async uploadFile(destinationUrl: string, fileItemStructure: FileItemStructure);

  abstract async getDnsServers(): Promise<string[]>;

  abstract formatDestinationPathForDomain(): string;
}
