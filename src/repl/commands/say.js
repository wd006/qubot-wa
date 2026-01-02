module.exports = {
    name: 'say',
    description: 'repl_say_desc', // Send a message to the specified chat.
    usage: '<chat_id> <message> <parameters>',

    execute: async function (sock, args) {
        if (args.length < 2) {
            console.log(`❌ Usage: ${this.name} ${this.usage}`);
            return;
        }

        const chatId = args[0].includes('@') ? args[0] : `${args[0]}@s.whatsapp.net`;
        const message = args.slice(1).join(' ');

        const groupMetadata = await sock.groupMetadata(chatId);

        const participants = groupMetadata.participants.map(p => p.id);



        try {
            await sock.sendMessage(chatId, { text: message, mentions: participants });
            console.log(`✅ Message sent to: "${chatId}"`);
        } catch (e) {
            console.error("❌ Message could not be sent:", e.message);
        }
    }
};