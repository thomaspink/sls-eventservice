// tslint:disable:max-line-length

import * as fs from 'fs';
import * as rimraf from 'rimraf';

export const readFile: (path: string, encoding: string) => Promise<string> = promisifyFn(fs.readFile);
export const writeFile: (path: string, contents: string) => Promise<void> = promisifyFn<void>(fs.writeFile);
export const readDir: (path: string) => Promise<string[]> = promisifyFn(fs.readdir);
export const removeFileOrDir: (path: string) => Promise<void> = promisifyFn<void>(rimraf);

export function promisifyFn<T>(fn: (...args: any[]) => void): () => Promise<T> {
  return (...args: any[]) => {
    return new Promise((resolve, reject) => {
      fn(...args, (err: any, data: T) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  };
}


