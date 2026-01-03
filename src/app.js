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
    prompts: {}   // prompt files (*.prompt)
};

// load prompts
function loadPrompt(fileName) {
    try {
        const filePath = path.join(app.root, 'prompts', fileName);
        if (!fs.existsSync(filePath)) return ''; 
        
        const content = fs.readFileSync(filePath, 'utf8');
        return content.replace(/<!--[\s\S]*?-->/g, '').trim();
    } catch (error) {
        console.error(`⚠️ Prompt read error: ${fileName}`, error.message);
        return '';
    }
}

console.log('🔄 System is loading...');
console.log(`📢 Prefix: ${app.config.PREFIX}`);

// save prompts
app.prompts.core = loadPrompt('core.prompt');
app.prompts.actions = loadPrompt('actions.prompt');
app.prompts.persona = fs.existsSync(path.join(app.root, 'prompts', 'persona.prompt'))
    ? loadPrompt('persona.prompt')
    : loadPrompt('persona.prompt.example'); // if the user did not change file name

// combine system prompts
app.config.SYSTEM_PROMPT = `${app.prompts.core}\n\n${app.prompts.actions}\n\n${app.prompts.persona}`;

console.log('✅ Prompts are ready.');

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