const readline = require('readline');
const fs = require('fs');
const path = require('path');

const commands = new Map();

/**
 * It dynamically loads terminal commands.
 */
function loadCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        // CommonJS'de dinamik yükleme için require kullanılır.
        const command = require(filePath);
        if (command.name) {
            commands.set(command.name, command);
        }
    }
    console.log(`💻 ${commands.size} number of terminal commands were loaded.`);
}

/**
 * The terminal starts the command prompt.
 * @param {object} sock - Baileys socket connector
 */
function start(sock) {
    loadCommands();

    console.log("⌨️  The terminal command prompt is active. You can start by typing 'help'.");
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '🤖 > '
    });

    rl.prompt();

    // async. because execute is async.
    rl.on('line', async (line) => {
        const [commandName, ...args] = line.trim().split(' ');
        const command = commands.get(commandName.toLowerCase());

        if (command) {
            try {
                // send the entire list of commands specifically to the help command.
                await command.execute(sock, args, commands);
            } catch (error) {
                console.error(`❌ An error occurred while executing the command. (${commandName}):`, error);
            }
        } else if (commandName) {
            console.log("❓ Unknown command. You can get help by typing 'help'.");
        }
        
        rl.prompt();
    });

    rl.on('close', () => {
        console.log("Goodbye!"); // closing message
        process.exit(0);
    });
}

module.exports = { start };