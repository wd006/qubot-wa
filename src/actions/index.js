// src/actions/index.js

module.exports = (app) => {
    const { fs, path } = app.lib;
    
    const actionMap = new Map();
    const commandMap = new Map();

    // this dir
    const actionsDir = __dirname;
    
    // get all .js files (exclude index)
    const files = fs.readdirSync(actionsDir).filter(file => file.endsWith('.js') && file !== 'index.js');

    console.log(`📂 Scanning actions... (${files.length} file)`);

    for (const file of files) {
        const filePath = path.join(actionsDir, file);
        
        // dynamic
        const actionModule = require(filePath); 

        // add to ai action map
        if (actionModule.actionName) {
            actionMap.set(actionModule.actionName, actionModule);
        }

        // add to prefixied command map
        if (actionModule.command) {
            const cmdName = actionModule.command.name.toLowerCase();
            commandMap.set(cmdName, actionModule);

            // add the aliases as well
            if (actionModule.command.aliases) {
                actionModule.command.aliases.forEach(alias => {
                    commandMap.set(alias.toLowerCase(), actionModule);
                });
            }
        }
    }

    console.log(`✅ ${actionMap.size} AI actions and ${commandMap.size} commands have been loaded.`);

    return {
        actions: actionMap,
        commands: commandMap
    };
};