// src/actions/reaction.js

function isEmoji(str) {
    const emojiRegex = /^(\p{Extended_Pictographic}|\p{Emoji_Presentation})/u;
    return emojiRegex.test(str);
}

module.exports.command = {
    name: 'reaction',
    aliases: ['tepki', 'react'],
    description: 'action_reaction_desc',
    usage: '[emoji]'
};

module.exports.actionName = 'leave_a_reaction';

module.exports.execute = async function (sock, msg, params, app) {
    const { t } = app.utils;

    let emoji;


    if (typeof params === 'string') {
        emoji = params.trim(); // from user
    } else {
        emoji = params.emoji; // from ai
    }

    // is replied?
    let targetKey = msg.key;
    const contextInfo = msg.message?.extendedTextMessage?.contextInfo;

    if (contextInfo && contextInfo.stanzaId) {
        targetKey = {
            remoteJid: msg.key.remoteJid,
            id: contextInfo.stanzaId,
            participant: contextInfo.participant
        };
    }

    try {
        if (isEmoji(emoji)) {
            await sock.sendMessage(msg.key.remoteJid, {
                react: {
                    text: emoji,
                    key: targetKey
                }
            });
        } else {
            // If it's a user message, then it will give an error.
            if (typeof params === 'string') {
                await sock.sendMessage(msg.key.remoteJid, { text: t('action_reaction_invalid') });
            }
        }

    } catch (error) {
        console.error("❌ Reaction Error:", error.message);
        await sock.sendMessage(msg.key.remoteJid, { text: t('action_reaction_error_general') });
    }
};