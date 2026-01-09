// src/actions/sticker.js
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');

module.exports.command = {
    name: 'sticker',
    aliases: ['s', 'stiker'],
    description: 'action_sticker_desc'
};

module.exports.actionName = 'make_a_sticker';

module.exports.execute = async function (sock, msg, params, app) {
    const { t, logger: log } = app.utils;

    const contextInfo = msg.message.extendedTextMessage?.contextInfo || msg.message.imageMessage?.contextInfo;
    const quotedMessage = contextInfo?.quotedMessage;

    // replied?
    const isQuotedImage = quotedMessage?.imageMessage;
    // sent img?
    const isDirectImage = msg.message.imageMessage;
    
    let targetMsg;

    if (isQuotedImage) {
        // reply -> ai or user
        targetMsg = { message: quotedMessage };
        log.info('ACTIONS', 'sticker: Target is a quoted image.');
    } else if (isDirectImage) {
        // sent img -> ai or user
        targetMsg = msg;
        log.info('ACTIONS', 'sticker: Target is the message itself (Caption).');
    } else {
        // no target -> error or be silent
        if (typeof params === 'string') {
            await sock.sendMessage(msg.key.remoteJid, { text: t('action_sticker_error_usage') }, { quoted: msg });
        } else {
             log.warn('ACTIONS', 'sticker: AI triggered action but no image found.');
        }
        return;
    }

    // get img
    const buffer = await downloadMediaMessage(
        targetMsg,
        'buffer',
        {},
        { 
            logger: log,
            reuploadRequest: sock.updateMediaMessage
        }
    );

    // gen sticker
    const stickerBuffer = await sharp(buffer)
        .resize(512, 512, { 
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .webp()
        .toBuffer();

    // send
    await sock.sendMessage(
        msg.key.remoteJid, 
        { sticker: stickerBuffer },
        { quoted: msg }
    );
};