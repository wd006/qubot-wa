// src/actions/reaction.js

function isEmoji(str) {
    if (!str) return false;
    const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/;
    return emojiRegex.test(str);
}

module.exports.command = {
    name: 'react',
    aliases: ['tepki', 'reaction'],
    description: 'action_reaction_desc',
    usage: '[emoji]'
};

module.exports.actionName = 'leave_a_reaction';

module.exports.execute = async function (sock, msg, params, app) {
    const { t, logger: log } = app.utils;

    let emoji;
    let targetMessageId = null;

    if (typeof params === 'string') {
        emoji = params.trim(); // !react 👍 -> from user
    } else if (params) {
        emoji = params.emoji; // { emoji: '👍', message_id: '...' } -> from ai
        targetMessageId = params.message_id;
    }

    if (!emoji || !isEmoji(emoji)) {
        // user wrong usage
        if (typeof params === 'string') {
            await sock.sendMessage(msg.key.remoteJid, { text: t('action_reaction_error_usage') });
        }
        return;
    }
    
    // define target message
    let targetKey;
    const contextInfo = msg.message?.extendedTextMessage?.contextInfo;

    // ai returned a msdID
    if (targetMessageId) {
        targetKey = {
            remoteJid: msg.key.remoteJid,
            id: targetMessageId,
            participant: msg.key.participant // for groups
        };
        log.info('ACTIONS', 'react: AI targeted a specific message', `ID: ${targetMessageId}`);
    }
    // user replied a msg
    else if (contextInfo && contextInfo.stanzaId) {
        targetKey = {
            remoteJid: msg.key.remoteJid,
            id: contextInfo.stanzaId,
            participant: contextInfo.participant // for groups
        };
        log.info('ACTIONS', 'react: User replied with command', `ID: ${contextInfo.stanzaId}`);
    }
    // no target -> use trigger msg
    else {
        targetKey = msg.key;
        log.info('ACTIONS', 'react: No target, reacting to trigger message', `ID: ${msg.key.id}`);
    }
    
    await sock.sendMessage(msg.key.remoteJid, {
        react: {
            text: emoji,
            key: targetKey
        }
    });
};