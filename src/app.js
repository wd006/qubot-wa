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
console.log(`📢 Prefix: ${app.config.PREFIX}`);

// load utils
console.log('🔄 Utils are loading...');
app.utils = require('./utils')(app);
console.log('✅ Utils are ready.');

// load ai services
console.log('🔄 AI Services are launching...');
app.services = require('./services')(app);
const provider = app.config.AI.activeProvider;
const modelInfo = app.config.AI[provider];
console.log(`✅ AI Service ready. Active Model: ${provider.toUpperCase()} / ${modelInfo?.model?.toUpperCase() || 'UNKNOWN'}`);

// load ai actions & prefix commands
console.log('🔄 Actions and Commands are loading...');
const loadedActions = require('./actions')(app); 

// Put the maps into the app.
app.actions = loadedActions.actions;
app.commands = loadedActions.commands;

console.log(`✅ ${app.actions.size} Actions and ${app.commands.size} Commands are ready.`);
console.log('🟢 ALL SYSTEMS ARE OPERATIONAL!');
console.log('🚀 BOT READY!');

module.exports = app;