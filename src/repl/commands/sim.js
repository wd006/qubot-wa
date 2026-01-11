// src/repl/commands/sim.js
const handleMessage = require('../../handlers/message');
const util = require('util');

module.exports = {
    name: 'sim',
    description: 'Simulate a WhatsApp message (Bot Logic Test)',
    usage: '<message>',

    execute: async function (realSock, args, app) {
        
        const log = app.utils.logger;

        const text = args.join(' ');
        
        if (!text) {
            log.error('REPL', "sim: You need to write the message to be simulated. Example: sim Hello");
            return;
        }

        log.info('REPL', `sim: The incoming message is simulating.: "${text}"`);

        // fake msg object (in baileys format)
        const fakeJid = '1234567890@s.whatsapp.net';
        const fakeMsg = {
            key: {
                remoteJid: fakeJid,
                fromMe: false,
                id: 'SIMULATED_' + Date.now(),
                participant: undefined // no group (undefined)
            },
            pushName: 'Tester (You)',
            messageTimestamp: Date.now() / 1000,
            message: {
                conversation: text // plain text msg
            }
        };

        const m = { messages: [fakeMsg], type: 'notify' };

        // mock socket connection
        // the message will drops here instead of wa
        const mockSock = {
            user: { id: 'Bot@s.whatsapp.net' },
            
            sendMessage: async (jid, content, options) => {
                const type = Object.keys(content)[0];
                const body = content.text || content.caption || '[Media Content]';
                
                console.log('\n------------------------------------------------');
                console.log(`📤 [SIMULATOR OUTGOING] Bot Responded`);
                console.log(`👉 To: ${jid}`);
                console.log(`📦 Type: ${type}`);
                
                if (content.text) {
                    console.log(`💬 Text: \x1b[32m"${content.text}"\x1b[0m`);
                } else if (content.image) {
                    console.log(`🖼️ Image: [Buffer Data]`);
                    console.log(`📝 Caption: "${content.caption}"`);
                } else {
                    console.log(util.inspect(content, { colors: true, depth: 1 }));
                }
                
                console.log('------------------------------------------------\n');
                return { key: { id: 'FAKE_BOT_MSG_ID' } }; // fake reply id
            },

            // cancel typing effects
            sendPresenceUpdate: async () => {},
            readMessages: async () => {},
            
            // mock reuploadRequest (for sticker.js)
            updateMediaMessage: async () => ({ mediaKey: Buffer.from('fake') }) 
        };

        // call real handler with fake datas
        try {
            await handleMessage(mockSock, m, app);
        } catch (e) {
            log.error('REPL', "sim: Error during simulation:", e);
        }
    }
};