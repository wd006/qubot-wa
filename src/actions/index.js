// src/actions/index.js

module.exports = (app) => {
    const { fs, path } = app.lib;
    const log = app.utils.logger;
    
    const actionMap = new Map();
    const commandMap = new Map();

    // this dir
    const actionsDir = __dirname;
    
    // get all .js files (exclude index)
    const files = fs.readdirSync(actionsDir).filter(file => file.endsWith('.js') && file !== 'index.js');

    log.info('ACTIONS', 'Scanning actions...', `${files.length} action files found`);

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

    log.success('ACTIONS', 'Scanning completed:', `${actionMap.size} AI actions are ready.`); // and ${commandMap.size} user actions 

    return {
        actions: actionMap,
        commands: commandMap
    };
};