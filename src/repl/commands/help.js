//const helpers = require('../../utils');

module.exports = {
    name: 'help',
    description: 'repl_help_desc',

    execute: async function(sock, args, commands) {
        console.log("\n--- 💻 Terminal Commands ---");
        
        const sortedCommands = [...commands.values()].sort((a, b) => a.name.localeCompare(b.name));

        for (const command of sortedCommands) {
            console.log(`> ${command.name}`);

            if (command.description) {
                console.log(`  ${helpers.t(command.description)}`);
            }

            if (command.usage) {
                console.log(`  Usage: ${command.name} ${command.usage}`);
            }
            console.log("");
        }
        console.log("----------------------------");
    }
};