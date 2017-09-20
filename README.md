# SLS Eventservice
New website for [sls-eventservice.at](http://sls-eventservice.at)    
Development server: [sls-eventservice.ch](http://www.sls-eventservice.ch/)

## Prerequisite

1. Make sure [node.js](https://nodejs.org) is installed
2. Make [composer](https://getcomposer.org/download/) is installed (either globally or locally)
3. Run `npm install` to install all dependencies and compile all the tools (see also [Tools](#tools))
4. Run `npm run setup` to install wordpress and all plugins locally and start the setup wizzard.

## Run locally
Run `npm start` in your Command Line Tool.

## Deploy
To build for production run `npm run build` in your Command Line Tool.    
This will generate a `dist` folder ready for deployment.

## Tools
This repo also has tools for setting up wordpress, installing plugins, writing configs, ...
Those tools are either shell scripts (in the scripts folder) or node scripts (the sources are
in the src/tools folder). The node scripts need to be compiled to be used. This will happen
automatically if you run `npn install`. In case the tools have changed and/or you just want
to recompile them, run `npm run tools:build`. This will produce a `dist/.tools` folder.
