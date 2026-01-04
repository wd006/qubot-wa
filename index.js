// index.js
const util = require('util');

// baileys log silencer
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;
const originalInfo = console.info;

const IGNORED_LOGS = [
    'Closing session: SessionEntry', 'Session error:', 'Bad MAC', 'Failed to decrypt',
    'ratchet', 'preKey', 'chainKey', 'identityKey', 'invalid message', 'axolotl' 
];

function shouldSilence(args) {
    const msg = util.format(...args);
    return IGNORED_LOGS.some(phrase => msg.includes(phrase));
}

console.log = (...args) => { if (!shouldSilence(args)) originalLog.apply(console, args); };
console.error = (...args) => { if (!shouldSilence(args)) originalError.apply(console, args); };
console.warn = (...args) => { if (!shouldSilence(args)) originalWarn.apply(console, args); };
console.info = (...args) => { if (!shouldSilence(args)) originalInfo.apply(console, args); };

// imports
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');

const app = require('./src/app');
const handleMessage = require('./src/handlers/message');
const handleConnection = require('./src/handlers/connection');

async function connect() {
    // get auth state
    const { state, saveCreds } = await useMultiFileAuthState('auth_session');
    
    // add auth object to app
    app.state = { state, saveCreds };

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }), 
        printQRInTerminal: false,
        auth: state,
        generateHighQualityLinkPreview: true,
        browser: ["Ubuntu", "Chrome", "20.0.04"] 
    });

    // handlers
    
    // connection management (pass the function itself as a parameter for reconnect)
    handleConnection(sock, app, connect);

    // message upsert
    sock.ev.on('messages.upsert', (m) => handleMessage(sock, m, app));
}

connect();