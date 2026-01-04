// index.js
require('./src/utils/log-interceptor').init();

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