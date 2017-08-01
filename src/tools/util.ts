import * as fs from 'fs';


export const readFile = promisifyFn(fs.readFile);
export const writeFile = promisifyFn(fs.writeFile);
export const readDir = promisifyFn(fs.readdir);

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


