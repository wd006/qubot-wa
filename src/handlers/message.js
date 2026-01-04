// src/handlers/message.js
const { delay } = require('@whiskeysockets/baileys');

async function simulateTyping(sock, jid, text, config) {
    if (!config.COMPOSING.enabled) return;
    const { charPerSec, minDelay, maxDelay } = config.COMPOSING;
    let typingDuration = (text.length / charPerSec) * 1000;
    typingDuration += Math.random() * 1000;
    typingDuration = Math.max(minDelay, Math.min(typingDuration, maxDelay));
    
    await sock.sendPresenceUpdate('composing', jid);
    await delay(typingDuration);
    await sock.sendPresenceUpdate('paused', jid);
}

module.exports = async function handleMessage(sock, m, app) {
    const log = app.utils.logger;

    try {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        // parsing
        let parsedMsg = app.utils.parser.parse(msg);
        log.incoming(parsedMsg);

        // owner control
        const owner = app.config.OWNER_NUMBER;
        const sender = msg.key.participant || msg.key.remoteJid;

        if (owner) { 
            // compare only numbers
            if (sender.split('@')[0] !== owner.split('@')[0]) {
                log.warn('AUTH', `🚫 Access Denied: Message from ${sender} is not from the owner.`);
                return; 
            }
        }

        const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

        // --- PREFIXED COMMANDS (!cmd) ---
        if (body && body.startsWith(app.config.PREFIX)) {
            const args = body.slice(app.config.PREFIX.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const commandHandler = app.commands.get(commandName);

            if (commandHandler) {
                log.info('CMD', `Command Triggered: ${commandName}`);
                await commandHandler.execute(sock, msg, args.join(' '), app);
                return;
            }
        }

        // --- AI REQUEST ---

        // create prompt
        const richPrompt = await app.utils.prompt.build(sock, msg);
        log.debug('AI', 'Prompt Sending:', richPrompt);

        // send to active ai service
        const aiDecision = await app.services.active.getResponse(richPrompt);

        if (!aiDecision || !aiDecision.thought) {
            log.error('AI', "A valid JSON decision could not be obtained from the AI.");
            return;
        }

        log.decision(aiDecision);

        // apply ai decision
        
        // should_reply?
        if (aiDecision.should_reply && aiDecision.reply_text) {
            await simulateTyping(sock, msg.key.remoteJid, aiDecision.reply_text, app.config);
            await sock.sendMessage(msg.key.remoteJid, { text: aiDecision.reply_text }, { quoted: msg });
        }

        // action?
        if (aiDecision.action) {
            const actionHandler = app.actions.get(aiDecision.action.type);
            if (actionHandler) {
                await actionHandler.execute(sock, msg, aiDecision.action.params, app);
            } else {
                log.error('AI', 'AI requested a non-existent action:', (aiDecision.action.type));
            }
        }

    } catch (err) {
        log.error("❌ Message Handler Error:", err);
    }
};