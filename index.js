// index.js
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');

const app = require('./src/app');
const repl = require('./src/repl');

let isReplStarted = false;

async function simulateTyping(sock, jid, text) {
    if (!app.config.COMPOSING.enabled) return;
    const { charPerSec, minDelay, maxDelay } = app.config.COMPOSING;
    let typingDuration = (text.length / charPerSec) * 1000;
    typingDuration += Math.random() * 1000;
    typingDuration = Math.max(minDelay, Math.min(typingDuration, maxDelay));
    await sock.sendPresenceUpdate('composing', jid);
    await delay(typingDuration);
    await sock.sendPresenceUpdate('paused', jid);
}

async function connect() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_session');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        generateHighQualityLinkPreview: true,
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log("\n");
            qrcode.generate(qr, { small: true });
            console.log("📲 Please scan the QR code from WhatsApp.\n");
        }

        if (connection === 'close') {
            const reason = (lastDisconnect.error)?.output?.statusCode || (lastDisconnect.error)?.message;
            console.error('❌ Connection Error:', lastDisconnect.error);
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(`⚠️ Connection lost! (code: ${reason}). reconnect? -> ${shouldReconnect}`);
            if (shouldReconnect) connect();
        } else if (connection === 'open') {
            console.log(`\n✅ WHATSAPP CONNECTION SUCCESSFUL!`);
            console.log(`🧠 Active AI: ${app.config.AI.activeProvider.toUpperCase()} / ${(app.config.AI[app.config.AI.activeProvider].model).toUpperCase()}`);
            console.log(`🤖 Bot is Ready. Prefix: "${app.config.PREFIX}"`);
            if (!isReplStarted) {
                repl.start(sock, app);
                isReplStarted = true;
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            app.utils.logIncomingMessage(msg);

            // owner control
            const owner = app.config.OWNER_NUMBER;
            const sender = msg.key.participant || msg.key.remoteJid;

            if (owner) { // is it defined in .env?
                // compare only numbers
                if (sender.split('@')[0] !== owner.split('@')[0]) {
                    console.log(`🚫 Access Denied: Message from ${sender} is not from the owner.`);
                    return; // denied
                }
            }

            // get body for prexified commands
            const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

            // --- PREFIXED COMMANDS ---
            if (body && body.startsWith(app.config.PREFIX)) {
                const args = body.slice(app.config.PREFIX.length).trim().split(/ +/);
                const commandName = args.shift().toLowerCase();
                const commandHandler = app.commands.get(commandName);
                
                if (commandHandler) {
                    console.log(`⚡️ Prefix Command Detected: ${commandName}`);
                    await commandHandler.execute(sock, msg, args.join(' '), app);
                    return;
                }
            }

            // --- AI REQUEST ---
            
            // richPrompt
            const richPrompt = await app.utils.prompt.build(sock, msg);
            console.log('\n🧠 Prompt going to AI:\n', richPrompt);

            // send to active ai service
            const aiDecision = await app.services.active.getResponse(richPrompt);
            
            if (!aiDecision || !aiDecision.thought) {
                console.error("❌ A valid JSON decision could not be obtained from the AI.");
                return;
            }
            
            app.utils.logAIDecision(aiDecision);

            // --- DECISION HANDLING ---
            if (aiDecision.should_reply && aiDecision.reply_text) {
                await simulateTyping(sock, msg.key.remoteJid, aiDecision.reply_text);
                await sock.sendMessage(msg.key.remoteJid, { text: aiDecision.reply_text }, { quoted: msg });
            }

            if (aiDecision.action) {
                const actionHandler = app.actions.get(aiDecision.action.type);
                if (actionHandler) {
                    await actionHandler.execute(sock, msg, aiDecision.action.params, app);
                } else {
                    console.error(`❌ ERROR: AI requested a non-existent action -> ${aiDecision.action.type}`);
                }
            }

        } catch (err) {
            console.error("❌ Main Loop Error:", err);
        }
    });
}

connect();