const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');

const app = require('./src/app');
const repl = require('./src/repl'); // terminal commands

let isReplStarted = false;

/**
 * WhatsApp 'typing' status.
 */
async function simulateTyping(sock, jid, text) {
    if (!app.config.COMPOSING.enabled) return;

    const { charPerSec, minDelay, maxDelay } = app.config.COMPOSING;
    
    // calc delay based on message length
    let typingDuration = (text.length / charPerSec) * 1000;
    
    // randomization
    typingDuration += Math.random() * 1000; 

    // check limits
    typingDuration = Math.max(minDelay, Math.min(typingDuration, maxDelay));

    await sock.sendPresenceUpdate('composing', jid);
    await delay(typingDuration);
    await sock.sendPresenceUpdate('paused', jid);
}

async function connect() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_session');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false, // qrcode-terminal
        auth: state,
        generateHighQualityLinkPreview: true,
    });

    // --- CONNECTION EVENTS ---
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log("\n");
            qrcode.generate(qr, { small: true });
            console.log("📲 Please scan the QR code from WhatsApp.\n");
        }

        if (connection === 'close') {

            const reason = (lastDisconnect.error)?.output?.statusCode || (lastDisconnect.error)?.message;
            console.error('❌ Bağlantı Hatası:', lastDisconnect.error);

            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(`⚠️ Connection lost! (code: ${reason}). reconnect? -> ${shouldReconnect}`);
            
            if (shouldReconnect) connect();
        }
        else if (connection === 'open') {
            console.log(`✅ WHATSAPP CONNECTION SUCCESSUL!`);
            
            // start repl listening
            if (!isReplStarted) {
                repl.start(sock);
                isReplStarted = true;
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // --- MESSAGE LISTENER ---
    sock.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            // log message
            app.utils.logIncomingMessage(msg);

            // get contents
            const body = msg.message?.conversation || 
                         msg.message?.extendedTextMessage?.text || 
                         msg.message?.imageMessage?.caption;

            if (!body) return; // terminate if it's not a text message.

            // allowed number control
            const sender = msg.key.participant || msg.key.remoteJid;
            if (app.config.ALLOWED_NUMBERS && app.config.ALLOWED_NUMBERS.length > 0) {
                if (!app.config.ALLOWED_NUMBERS.includes(sender)) {
                    console.log(`🚫 Unauthorized access attempt: ${sender}`);
                    return;
                }
            }

            // --- 1) PREFIXIED COMMANDS ---
            if (body.startsWith(app.config.PREFIX)) {
                const args = body.slice(app.config.PREFIX.length).trim().split(/ +/);
                const commandName = args.shift().toLowerCase();
                
                const commandHandler = app.commands.get(commandName);
                
                if (commandHandler) {
                    console.log(`⚡ Prefixied Command Detected: ${commandName}`);
                    // send with 'app'
                    await commandHandler.execute(sock, msg, args.join(' '), app);
                    return; // if the worked, dont request to ai.
                }
            }

            // --- 2) AI REQUEST ---
            const senderName = msg.pushName || "User";
            
            // invoke active ai service
            const aiDecision = await app.services.active.getResponse(body, senderName);
            
            // logging
            app.utils.logAIDecision(aiDecision);

            // decision to speak
            if (aiDecision.should_reply && aiDecision.reply_text) {
                // typing effect
                await simulateTyping(sock, msg.key.remoteJid, aiDecision.reply_text);
                
                // send
                await sock.sendMessage(msg.key.remoteJid, { text: aiDecision.reply_text }, { quoted: msg });
            }

            // decision to action 
            if (aiDecision.action) {
                const actionHandler = app.actions.get(aiDecision.action.type);
                
                if (actionHandler) {
                    // run action with 'app'
                    await actionHandler.execute(sock, msg, aiDecision.action.params, app);
                } else {
                    console.error(`❌ ERROR: AI made a faulty call to action -> ${aiDecision.action.type}`);
                }
            }

        } catch (err) {
            console.error("❌ Main Loop Error:", err);
        }
    });
}

// Bismillah
connect();