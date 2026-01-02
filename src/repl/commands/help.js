module.exports = {
    name: 'help',
    description: 'List all terminal commands.',

    // This command needs to know all other commands, so
    // it will take the 'commands' map as a parameter from the main REPL manager.
    execute: async function(sock, args, commands) {
        console.log("\n--- 💻 Terminal Commands ---");
        
        const sortedCommands = [...commands.values()].sort((a, b) => a.name.localeCompare(b.name));

        for (const command of sortedCommands) {
            console.log(`> ${command.name}`);
            if (command.description) console.log(`  ${command.description}`);
            if (command.usage) console.log(`  Usage: ${command.name} ${command.usage}`);
            console.log("");
        }
        console.log("----------------------------");
    }
};