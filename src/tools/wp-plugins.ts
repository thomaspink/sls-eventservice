import * as util from './util';
import * as fs from 'fs';
import * as chalk from 'chalk';
import * as AdmZip from 'adm-zip';
import * as pathUtil from 'path';

export async function main(outdir: string, project?: string): Promise<number | void> {
  try {
    if (!project) {
      project = 'package.json';
    }
    // Read and parse package.json
    const configStr = await util.readFile(project, 'utf8');
    const config = JSON.parse(configStr);
    const wpPlugins = config['wp-plugins'];

    // Script can finish imediately if package.json has no wp-plugins object
    if (typeof wpPlugins !== 'object') {
      return Promise.resolve();
    }
    for (let name in wpPlugins) {
      if (wpPlugins.hasOwnProperty(name)) {
        console.log(`Downloading plugin ${chalk.italic(name)}`);
        const url = wpPlugins[name];
        const buf = await util.download(url);
        console.log(`Installing plugin ${chalk.italic(name)}`);
        const zip = new AdmZip(buf);
        zip.extractAllTo(pathUtil.join(outdir, name), /*overwrite*/true);
        console.log(`Finished installing plugin ${chalk.italic(name)}`);
      }
    }
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const options = util.getCommandlineArgs(args);
  const config = options['project'];
  const outDir = options['out'];
  (() => {
    if (typeof outDir !== 'string') {
      // tslint:disable-next-line:max-line-length
      return Promise.reject('No output directory provided where the wordpress plugis will be installed');
    }
    console.log('\n' + chalk.bold('Installing wordpress plugins'));
    return main(outDir, config).then(_ => {
      console.log(chalk.bold(chalk.green('Wordpress plugins successfully installed')));
    });
  })()
    .then(function (exitCode) { return process.exit(exitCode || 0); })
    .catch(function (e) {
      console.error(e);
      if (e.stack) {
        console.error(e.stack);
      }
      console.error('Installing wordpress plugins failed');
      process.exit(1);
    });
}
