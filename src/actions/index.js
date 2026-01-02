const fs = require('fs');
const path = require('path');
const helpers = require('../utils');

const actionMap = new Map(); // keeps the AI ​​action names.
const commandMap = new Map(); // keeps the classic command names.

/**
 * It scans all the files in the actions folder and populates the maps.
 */
function loadActions() {
    const actionsPath = path.join(__dirname);
    const actionFiles = fs.readdirSync(actionsPath).filter(file => file.endsWith('.js') && file !== 'index.js');

    for (const file of actionFiles) {
        const filePath = path.join(actionsPath, file);
        const actionModule = require(filePath);

        // fill the AI ​​Action Map
        if (actionModule.actionName) {
            actionMap.set(actionModule.actionName, actionModule);
        }

        // fill the classic command map
        if (actionModule.command) {
            const cmd = actionModule.command;

            // add main command name
            commandMap.set(cmd.name.toLowerCase(), actionModule);

            // add aliases
            if (cmd.aliases && Array.isArray(cmd.aliases)) {
                cmd.aliases.forEach(alias => commandMap.set(alias.toLowerCase(), actionModule));
            }
        }
    }
    console.log(`✅ ${actionMap.size} AI action and ${commandMap.size} command loaded.`);
}

/**
 * It executes the action dictated by the AI.
 */
async function handleAIAction(sock, msg, actionData) {
    if (!actionData || !actionData.type) return;

    const handler = actionMap.get(actionData.type);
    if (handler) {
        await handler.execute(sock, msg, actionData.params, helpers);
    }
}

/**
 * It executes the command that comes with the prefix.
 */
async function handleCommand(sock, msg, commandName, args) {
    const handler = commandMap.get(commandName);
    if (handler) {
        const commandText = args.join(' ');
        await handler.execute(sock, msg, commandText, helpers);
        return true; // found and execute
    }
    return false; // no command
}

// load in start
loadActions();

module.exports = { handleAIAction, handleCommand };