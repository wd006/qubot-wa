const readline = require('readline');
const fs = require('fs');
const path = require('path');
const app = require('../app');
const log = app.utils.logger;

const commands = new Map();

/**
 * It dynamically loads terminal commands.
 */
function loadCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        // CommonJS -> require
        const command = require(filePath);
        if (command.name) {
            commands.set(command.name, command);
        }
    }
    log.info('REPL', 'Scanning commands...', `${commands.size} command files found.`);
}

/**
 * The terminal starts the command prompt.
 * @param {object} sock - Baileys socket connector
 * @param {object} app - config, utils...
 */
function start(sock, app) {
    loadCommands();

    log.success('REPL', 'Scanning completed:', `${commands.size} commands are ready.`);


    log.success('REPL', "⌨️ The terminal command prompt is ready. You can start by typing 'help'.");

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: ' > ' // 🤖 -> causes error
    });

    rl.prompt();

    // async. because execute is async.
    rl.on('line', async (line) => {
        const [commandName, ...args] = line.trim().split(' ');
        const command = commands.get(commandName.toLowerCase());

        if (command) {
            try {
                // send the entire list of commands specifically to the help command.
                await command.execute(sock, args, app, commands);
            } catch (error) {
                log.error('REPL', `(${commandName}): An error occurred`, error);
            }
        } else if (commandName) {
            log.warn('REPL', "❓ Unknown command. You can get help by typing 'help'.");
        }

        rl.prompt();
    });

    rl.on('close', () => {
        log.success('SYSTEM', "Goodbye!"); // closing message
        process.exit(0);
    });
}

module.exports = { start };