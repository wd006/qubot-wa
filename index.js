const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');

// call modules
const agent = require('./src/agent');
const config = require('./src/config');
const { handleAIAction, handleCommand } = require('./src/actions/index.js');
const logger = require('./src/utils/logger');
const repl = require('./src/repl/index.js'); // REPL manager


async function connect() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_session');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
    });

    // connection
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) qrcode.generate(qr, { small: true });

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) connect();
        } else if (connection === 'open') {
            console.log(`✅ Bot READY! Model: ${config.GEMINI_MODEL}`);
            repl.start(sock); // start terminal command listening
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // --- MAIN MESSAGE LISTENER ---
    sock.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            // 1. log
            logger.logIncomingMessage(msg);

            const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
            if (!body) return;


            // --- prefix control ---
            const prefix = config.prefix;
            if (body.startsWith(prefix)) {

                const args = body.slice(prefix.length).trim().split(/ +/);
                const commandName = args.shift().toLowerCase();
                
                console.log(`-⚡ Command: ${commandName}`);
                await handleCommand(sock, msg, commandName, args);
                
                // finish
                return; 
            }
            // --- end prefix control ---



            // 2. ai analysis
            const senderName = msg.pushName || "Unknown User";
            const aiDecision = await agent.processMessage(body, senderName);
            
            // 3. log
            logger.logAIDecision(aiDecision);

            // 4. will there be an answer?
            if (aiDecision.should_reply && aiDecision.reply_text) {
                
                const { charPerSec, minDelay, maxDelay, animation } = config.composing;
                let delayMs = (aiDecision.reply_text.length / charPerSec) * 1000;
                delayMs += Math.random() * 1000;
                delayMs = Math.min(Math.max(delayMs, minDelay), maxDelay);

                if (animation) {
                    await sock.sendPresenceUpdate('composing', msg.key.remoteJid);
                    await new Promise(r => setTimeout(r, delayMs));
                }

                await sock.sendMessage(msg.key.remoteJid, { text: aiDecision.reply_text }, { quoted: msg });

                if (animation) {
                    await sock.sendPresenceUpdate('paused', msg.key.remoteJid);
                }
            }

            // 5. direct the action (if any)
            if (aiDecision.action) {
                await handleAIAction(sock, msg, aiDecision.action);
            }

        } catch (err) {
            console.error("❌ Handler Error:", err);
        }
    });
}

// Başlat
connect();