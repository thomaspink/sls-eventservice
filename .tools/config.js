"use strict";
const minimist = require("minimist");
const inquirer = require("inquirer");
const stringValidatorFactory = (msg) => {
    return (value) => {
        if (value && value.length > 0) {
            return true;
        }
        return msg;
    };
};
const questions = [
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
        name: 'dbCollate',
        // tslint:disable-next-line:max-line-length
        message: '[Optional] - Enter your wordpress database collate (DB_COLLATE):'
    }
];
function main(templateFile, outdir, config, genKeys) {
    let genKeyFn = () => {
        return '';
    };
    if (typeof genKeys === 'function') {
        genKeyFn = genKeys;
        genKeys = true;
    }
    console.log(config);
    try {
        return Promise.resolve();
    }
    catch (e) {
        return Promise.reject(e);
    }
}
exports.main = main;
function askForOptions() {
    return inquirer.prompt(questions).then(answers => {
        return {
            dbName: answers['dbName'],
            dbUser: answers['dbUser'],
            dbPassword: answers['dbPassword'],
            dbHost: answers['dbHost'],
            dbCharset: answers['dbCharset'],
            dbCollate: answers['dbCollate']
        };
    });
}
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = minimist(args);
    const template = options['template'];
    const outDir = options['out'];
    const genKeys = !!options['generate-keys'];
    (() => {
        if (typeof template === 'string') {
            return Promise.reject('No path to the wp-config.php template file provided. ' +
                'Look for wp-config.sample.php');
        }
        if (typeof outDir === 'string') {
            return Promise.reject('No output directory provided where the wp-config.php will be written');
        }
        return askForOptions().then(config => main(template, outDir, config, genKeys));
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
