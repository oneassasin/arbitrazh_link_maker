import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';
import { glob } from 'glob';

export class FsUtil {
  static async findFilesByGlob(globString: string): Promise<string[]> {
    return await new Promise((resolve, reject) => {
      glob(globString, (err, matches) => {
        if (err) {
          return reject(err);
        }

        resolve(matches);
      });
    });
  }

  static async readFileFromPath(filePath: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          return reject(err);
        }

        resolve(data);
      });
    });
  }

  static async readFileAsStringFromPath(filePath: string): Promise<string> {
    const buffer = await this.readFileFromPath(filePath);
    return buffer.toString('utf8');
  }

  static async saveFileToPath(filePath: string, data: string) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, data, {flag: 'w+'}, err => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });
  }

  static async createFolder(folderPath: string) {
    return new Promise((resolve, reject) => {
      fs.mkdir(folderPath, {}, err => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });
  }

  static async isPathExists(folderPath: string): Promise<boolean> {
    return new Promise((resolve) => {
      fs.access(folderPath, err => {
        if (err) {
          return resolve(false);
        }
        resolve(true);
      });
    });
  }

  static async removeFolder(folderPath: string) {
    return new Promise(resolve => {
      rimraf(path.join(process.cwd(), folderPath), resolve);
    });
  }
}
