// src/handlers/connection.js
const { DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const repl = require('../repl');

let isReplStarted = false;

module.exports = (sock, app, reconnectFunc) => {
    const log = app.utils.logger;

    // Start REPL only once
    if (!isReplStarted) {
        repl.start(sock, app);
        isReplStarted = true;
    }

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log("\n");
            qrcode.generate(qr, { small: true });
            log.info("CONN", "📲 Please scan the QR code from WhatsApp.");
        }

        if (connection === 'close') {
            const error = lastDisconnect.error;
            const statusCode = error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            const reason = statusCode || error?.message;

            log.error('CONN', 'Connection Error:', error);
            log.warn('CONN', 'Connection lost!', `(code: ${reason}). reconnect? -> ${shouldReconnect}`);

            if (shouldReconnect) {
                reconnectFunc();
            }
        } else if (connection === 'open') {
            log.success('CONN', 'WhatsApp connection successful!');
        }
    });

    // listen creds.update from app.state
    sock.ev.on('creds.update', app.state.saveCreds);
};