// tslint:disable:max-line-length

import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as rimraf from 'rimraf';
import * as minimist from 'minimist';
import * as request from 'request';

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
    const data = [];
    let dataLen = 0;
    request.get(uri)
      .on('data', chunk => {
        data.push(chunk);
        dataLen += chunk.length;
      })
      .on('error', e => {
        reject(`Downloading ${uri} failed: ${e.message}`);
      })
      .on('complete', () => {
        try {
          const buf = new Buffer(dataLen);
          for (let i = 0, len = data.length, pos = 0; i < len; i++) {
            data[i].copy(buf, pos);
            pos += data[i].length;
          }
          resolve(buf);
        } catch (e) {
          reject(`Resolving buffer for download ${uri} failed: ${e.message || e}`);
        }
      });
  });
}
