import * as AdmZip from 'adm-zip';
import { Buffer } from 'buffer';
import { IZipEntry } from 'adm-zip';

export class ZipFileUtil {
  static async convertWhitePageZipArchive(buffer: Buffer): Promise<Buffer> {
    const archive = new AdmZip(buffer);

    const newArchive = new AdmZip();

    for (const entry of archive.getEntries()) {
      const name = entry.entryName;

      if (name.startsWith('php/') || name === 'html/') {
        continue;
      }

      const result = name.replace('html/', '');

      await this.handleEntity(result, entry, newArchive);
    }

    return newArchive.toBuffer();
  }

  static async convertBlackPageZipArchive(buffer: Buffer): Promise<Buffer> {
    const archive = new AdmZip(buffer);

    const newArchive = new AdmZip();

    for (const entry of archive.getEntries()) {
      const name = entry.entryName;

      const folderName = name.split('/', 1)[0];

      const result = name.replace(`${folderName}/`, '');

      await this.handleEntity(result, entry, newArchive);
    }

    return newArchive.toBuffer();
  }

  private static async handleEntity(entryName: string, entry: IZipEntry, archive: AdmZip): Promise<AdmZip> {
    if (entryName[entryName.length - 1] === '/') {
      archive.addFile(entryName, Buffer.from(''), entry.comment, entry.attr);
      return archive;
    }

    const data: Buffer = await new Promise<Buffer>(resolve => entry.getDataAsync(resolve));

    archive.addFile(entryName, data, entry.comment, entry.attr);

    return archive;
  }
}
