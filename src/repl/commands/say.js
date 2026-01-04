module.exports = {
    name: 'say',
    description: 'repl_say_desc',
    usage: '<chat_id> <message>',

    execute: async function (sock, args, app, commands) {

        const log = app.utils.logger;

        if (args.length < 2) {
            console.log(`❌ Usage: ${this.name} ${this.usage}`);
            return;
        }

        const chatId = args[0].includes('@') ? args[0] : `${args[0]}@s.whatsapp.net`;
        const message = args.slice(1).join(' ');

        //const groupMetadata = await sock.groupMetadata(chatId); // future: embed a @everyone mention
        //const participants = groupMetadata.participants.map(p => p.id);



        try {
            await sock.sendMessage(chatId, { text: message }); //, mentions: participants
            log.success('REPL', `say: Message sent to: "${chatId}"`);
        } catch (e) {
            log.error('REPL', 'say: Message could not be sent', e.message);
        }
    }
};