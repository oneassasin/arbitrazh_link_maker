import AdmZip from 'adm-zip';

export enum EFileItemType {
  Buffer = 'buffer',
  String = 'string',
  Zip = 'zip',
}

export class FileItemStructure {
  constructor(type: EFileItemType, name: string, value: AdmZip | string | Buffer) {
    this.type = type;
    this.name = name;
    this.value = value;
  }

  readonly type: EFileItemType;

  readonly name: string;

  readonly value: AdmZip | string | Buffer;
}
