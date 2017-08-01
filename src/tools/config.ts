import * as util from './util';
import * as minimist from 'minimist';

export function main(templateFile: string, outdir: string): Promise<number|void> {
  try {
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const options = minimist(args);
  const template = options['template'];
  const outDir = options['out'];
  (() => {
    if (typeof template === 'string') {
      return Promise.reject('No path to the wp-config.php template file provided. ' +
        'Look for wp-config.sample.php');
    }
    if (typeof outDir === 'string') {
      return Promise.reject('No output directory provided where the wp-config.php will be written');
    }
    return main(template, outDir);
  })()
  .then(function (exitCode) { return process.exit(exitCode || 0); })
  .catch(function (e) {
    console.error(e.stack);
    console.error('Writing wp-config.php failed');
    process.exit(1);
  });

}
