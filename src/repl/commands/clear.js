module.exports = {
    name: 'clear',
    description: 'repl_clear_desc',
    
    execute: async function(sock, args, app, commands) {

        const log = app.utils.logger;

        try {

            console.clear();
            console.log("\n");

        } catch (e) {
            log.error('REPL', 'clear: An error occurred', e);
        }
    }
};