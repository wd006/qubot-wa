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

console.log(`📢 Prefix: ${app.config.PREFIX}`);



// load ai services
log.info('BOOT', 'AI Services are launching...');
app.services = require('./services')(app);
const provider = app.config.AI.activeProvider;
const modelInfo = app.config.AI[provider];
log.success('BOOT', `AI Service ready! Active Model: ${provider.toUpperCase()} / ${modelInfo?.model?.toUpperCase() || 'UNKNOWN'}`);

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