import * as util from './util';
import * as inquirer from 'inquirer';
import * as chalk from 'chalk';

const KEY_PLACEHOLDER = 'put your unique phrase here';
const DB_NAME_PLACEHOLDER = 'database_name_here';
const DB_USER_PLACEHOLDER = 'username_here';
const DB_PASSWORD_PLACEHOLDER = 'password_here';
const DB_HOST_PLACEHOLDER = 'localhost';
const DB_CHARSET_PLACEHOLDER = 'utf8';
const DB_TABLE_PREFIX = 'wp_';
const WP_DEBUG_MODE_PLACEHOLDER = 'false';
interface WPConfig {
  dbName: string;
  dbUser: string;
  dbPassword: string;
  dbHost?: string;
  dbCharset?: string;
  dbTablePrefix?: string;
  debugMode: boolean;
}

/**
 * Generates a validator function with a specific error string
 * for the wizzard
 * @param msg Error message string
 */
const stringValidatorFactory = (msg: string) => {
  return (value: string) => {
    if (value && value.length > 0) {
      return true;
    }
    return msg;
  };
};

const questions: inquirer.Questions = [
  {
    type: 'input',
    name: 'dbName',
    message: 'Enter your wordpress database name (DB_NAME):',
    validate: stringValidatorFactory('Please enter a valid database name')
  }, {
    type: 'input',
    name: 'dbUser',
    message: 'Enter your wordpress database user (DB_USER):',
    validate: stringValidatorFactory('Please enter a valid database name')
  }, {
    type: 'input',
    name: 'dbPassword',
    message: 'Enter your wordpress database password (DB_PASSWORD):',
    validate: stringValidatorFactory('Please enter a valid password')
  }, {
    type: 'input',
    name: 'dbHost',
    message: '[Optional | defaults to localhost] - Enter your wordpress database host (DB_HOST):',
    default: 'localhost'
  }, {
    type: 'input',
    name: 'dbCharset',
    // tslint:disable-next-line:max-line-length
    message: '[Optional | defaults to utf8] - Enter your wordpress database charset encoding (DB_CHARSET):',
    default: 'utf8'
  }, {
    type: 'input',
    name: 'dbTablePrefix',
    message: '[Optional | defaults to wp_] - Enter your database table prefix:',
    default: 'wp_'
  }, {
    type: 'confirm',
    name: 'debugMode',
    message: 'Do you want to enable the WordPress debugging mode?'
  }
];

export async function main(templatePath: string, outdir: string, config: WPConfig,
    genKeys: boolean|(() => string)): Promise<number|void> {
  try {
    // set the function for generating keys
    let genKeyFn: () => string = () => genRandom(30);
    if (typeof genKeys === 'function') {
      genKeyFn = genKeys;
      genKeys = true;
    }

    const files = await util.readDir(outdir);

    // check if wp-config.php already exists
    // if so, ask user if we should override it
    if (files.indexOf('wp-config.php') !== -1) {
      const answer = await inquirer.prompt({
        type: 'confirm',
        name: 'confirmRemoval',
        message: 'A wp-config.php alreay exists. Should it be overwritten?'
      });

      // Finish here as the user wants to stick to the existing wp-config.php
      if (!answer['confirmRemoval']) {
        return Promise.resolve();
      }

      // Remove wp-config.php so we can create a new one
      await util.removeFileOrDir(outdir + '/wp-config.php');
    }

    // Read template config file
    let content = await util.readFile(templatePath, 'utf8');

    // Replace all the key placeholder with a generated one
    if (genKeys) {
      while (content.indexOf(KEY_PLACEHOLDER) !== -1) {
        content = content.replace(KEY_PLACEHOLDER, genKeyFn);
      }
    }

    // Replace all the config placeholder
    content = content.replace(DB_NAME_PLACEHOLDER, config.dbName);
    content = content.replace(DB_USER_PLACEHOLDER, config.dbUser);
    content = content.replace(DB_PASSWORD_PLACEHOLDER, config.dbPassword);
    content = content.replace(DB_HOST_PLACEHOLDER, config.dbHost);
    content = content.replace(DB_CHARSET_PLACEHOLDER, config.dbCharset);
    content = content.replace(DB_TABLE_PREFIX, config.dbTablePrefix);
    if (config.debugMode) {
      content = content.replace(WP_DEBUG_MODE_PLACEHOLDER, 'true');
    }

    // Create wp-config.php file and write content
    return util.writeFile(outdir + '/wp-config.php', content);
  } catch (e) {
    return Promise.reject(e);
  }
}

/**
 * Runs the wizzard and returns a config object
 */
export function askForOptions(): Promise<WPConfig> {
  console.log(chalk.bold('To configure wordpress we need some information:'));
  console.log('You can later change this options in your wp-config.php.');
  console.log('For more information visit https://codex.wordpress.org/Editing_wp-config.php\n');
  return inquirer.prompt(questions).then(answers => {
    return {
      dbName: answers['dbName'],
      dbUser: answers['dbUser'],
      dbPassword: answers['dbPassword'],
      dbHost: answers['dbHost'],
      dbCharset: answers['dbCharset'],
      dbTablePrefix: answers['dbTablePrefix'],
      debugMode: answers['debugMode']
    } as WPConfig;
  });
}

function genRandom(length = 16): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#+-/\&%$!?';
  let text = '';
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const options = util.getCommandlineArgs(args);
  const template = options['template'];
  const outDir = options['out'];
  const genKeys = !!options['generate-keys'];
  (() => {
    if (typeof template !== 'string') {
      return Promise.reject('No path to the wp-config.php template file provided. ' +
        'Look for wp-config.sample.php');
    }
    if (typeof outDir !== 'string') {
      return Promise.reject('No output directory provided where the wp-config.php will be written');
    }
    return askForOptions().then(config => main(template, outDir, config, genKeys)).then(_ => {
      console.log('\n\n' + chalk.bold(chalk.green('Configuration successfully finished')));
      console.log(`The wp-config.php has been created at "${outDir}/wp-config.php"`);
      // tslint:disable-next-line:max-line-length
      console.log(`You can change options now directly in the wp-config.php or run this wizzard again`);
      console.log('For more information visit https://codex.wordpress.org/Editing_wp-config.php\n');
    });
  })()
  .then(function (exitCode) { return process.exit(exitCode || 0); })
  .catch(function (e) {
    console.error(e);
    if (e.stack) {
      console.error(e.stack);
    }
    console.error('Writing wp-config.php failed');
    process.exit(1);
  });

}
