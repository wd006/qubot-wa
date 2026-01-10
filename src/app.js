const fs = require('fs');
const path = require('path');
const axios = require('axios');
const config = require('./config');

// define app object
const app = {
    root: path.join(__dirname, '../'), // project root dir
    config: config,                    // config.js
    lib: {                             // external libraries
        fs,
        path,
        axios
    },
    services: {}, // ai services (gemini, mistral...)
    actions: {},  // ai actions (currency, wiki...)
    commands: {}, // prefix commands (!currency, !wiki...)
    utils: {},    // helpers (l10n, logger...)
    prompts: {},   // prompt files (*.prompt)
    cache: {
        groupNames: new Map()
    }
};

console.log('🔄 System is loading...');

// load utils
console.log('🔄 Utils are loading...');
app.utils = require('./utils')(app);
log = app.utils.logger;
log.success('BOOT', 'Utils are ready!');

log.info('SYSTEM', `Prefix: ${app.config.PREFIX}`);



// load ai services
log.info('BOOT', 'AI Services are launching...');
app.services = require('./services')(app);
const LLMprovider = app.config.AI.LLM.activeProvider;
const LLMmodelInfo = app.config.AI.LLM[LLMprovider];
const MEDIAprovider = app.config.AI.MEDIA.activeProvider;
const MEDIAmodelInfo = app.config.AI.LLM[MEDIAprovider];
log.info('AI', `Setting LLM Model: ${LLMprovider.toUpperCase()} / ${LLMmodelInfo?.model?.toUpperCase() || 'UNKNOWN'}`);
log.info('AI', `Setting MEDIA Model: ${MEDIAprovider.toUpperCase()} / ${LLMmodelInfo?.model?.toUpperCase() || 'UNKNOWN'}`);
log.success('BOOT', `AI Services are ready!`);

// load ai actions & prefix commands
log.info('BOOT', 'Actions are loading...');
const loadedActions = require('./actions')(app); 

// Put the maps into the app.
app.actions = loadedActions.actions;
app.commands = loadedActions.commands;

log.success('BOOT', `${app.actions.size} Actions are ready!`);
log.success('SYSTEM', 'ALL SYSTEMS ARE OPERATIONAL!'); // 🟢
log.success('SYSTEM', 'BOT READY!'); // 🚀

module.exports = app;