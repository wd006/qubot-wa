// index.js
const util = require('util');

// baileys log blocker
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;
const originalInfo = console.info;

// word blacklist
const IGNORED_LOGS = [
    'Closing session: SessionEntry', 'Session error:', 'Bad MAC', 'Failed to decrypt',
    'ratchet', 'preKey', 'chainKey', 'identityKey', 'invalid message', 'axolotl' 
];

function shouldSilence(args) {
    const msg = util.format(...args);
    return IGNORED_LOGS.some(phrase => msg.includes(phrase));
}

// override console
console.log = (...args) => { if (!shouldSilence(args)) originalLog.apply(console, args); };
console.error = (...args) => { if (!shouldSilence(args)) originalError.apply(console, args); };
console.warn = (...args) => { if (!shouldSilence(args)) originalWarn.apply(console, args); };
console.info = (...args) => { if (!shouldSilence(args)) originalInfo.apply(console, args); };

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');

const app = require('./src/app');
const repl = require('./src/repl');
// call handler
const handleMessage = require('./src/handlers/message');

const log = app.utils.logger;
let isReplStarted = false;

async function connect() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_session');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }), 
        printQRInTerminal: false,
        auth: state,
        generateHighQualityLinkPreview: true,
        browser: ["Ubuntu", "Chrome", "20.0.04"] 
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log("\n");
            qrcode.generate(qr, { small: true });
            log.info("CONN", "📲 Please scan the QR code from WhatsApp.");
        }
        if (connection === 'close') {
            const reason = (lastDisconnect.error)?.output?.statusCode || (lastDisconnect.error)?.message;
            log.error('CONN', 'Connection Error:', lastDisconnect.error);
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            log.warn('CONN', 'Connection lost!', `(code: ${reason}). reconnect? -> ${shouldReconnect}`);
            if (shouldReconnect) connect();
        } else if (connection === 'open') {
            log.success('CONN', 'WhatsApp connection successful!');
            log.info('AI', 'Current AI Model:', `${app.config.AI.activeProvider.toUpperCase()} / ${(app.config.AI[app.config.AI.activeProvider].model).toUpperCase()}`);
            log.info('SYSTEM', `Prefix: "${app.config.PREFIX}"`);
            if (!isReplStarted) {
                repl.start(sock, app);
                isReplStarted = true;
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // upsert messages
    sock.ev.on('messages.upsert', (m) => handleMessage(sock, m, app));
}

connect();