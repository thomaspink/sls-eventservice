// tslint:disable:max-line-length

import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as rimraf from 'rimraf';
import * as minimist from 'minimist';

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

export function getCommandlineArgs(args: string[]): {[key: string]: string} {
  const options = minimist(args);
  for (let key in options) {
    if (options.hasOwnProperty(key)) {
      let value = options[key];
      if (Array.isArray(value)) {
        options[key] = value[value.length - 1];
      }
    }
  }
  return options;
}

export function download(uri: string): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    (/https:\/\/.*/.test(uri) ? https.get : http.get)(uri as any, res => {
      const { statusCode } = res;
      const contentType = res.headers['content-type'];

      if (statusCode !== 200) {
        // consume response data to free up memory
        res.resume();
        return reject(`Downloading ${uri} failed - StatusCode: ${statusCode}`);
      }

      const data = [];
      let dataLen = 0;
      res.on('data', chunk => {
        data.push(chunk);
        dataLen += chunk.length;
      });
      res.on('end', () => {
        try {
          const buf = new Buffer(dataLen);
          for (let i = 0, len = data.length, pos = 0; i < len; i++) {
            data[i].copy(buf, pos);
            pos += data[i].length;
          }
          resolve(buf);
        } catch (e) {
          reject(e);
        }
      }).on('error', (e) => {
        reject(e);
      });
    });
  });
}
