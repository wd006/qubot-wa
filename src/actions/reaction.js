// src/actions/reaction.js

function isEmoji(str) {
    if (!str) return false;
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
    let targetMessageId = null;

    if (typeof params === 'string') {
        emoji = params.trim(); // !react ❤️ -> from user
    } else if (params) {
        emoji = params.emoji; // {emoji: "❤️"} -> from ai
        targetMessageId = params.message_id; // target message id
    }

    if (!emoji) return; // ignore empty emoji.

    // defining the target message
    let targetKey;
    const contextInfo = msg.message?.extendedTextMessage?.contextInfo;

    // ai returned a target message.
    if (targetMessageId) {
        targetKey = {
            remoteJid: msg.key.remoteJid,
            id: targetMessageId
        };
        console.log(`🎯 AI Reaction (targeted): ${targetMessageId}`);
    }
    // user replied a message with !react [emoji]
    else if (typeof params === 'string' && contextInfo && contextInfo.stanzaId) {
        targetKey = {
            remoteJid: msg.key.remoteJid,
            id: contextInfo.stanzaId,
            participant: contextInfo.participant
        };
        console.log(`🎯 !react command (replied by user): ${contextInfo.stanzaId}`);
    }
    // ai did not specify a target message. target the trigger.
    else {
        targetKey = msg.key;
        console.log(`🎯 AI Reaction (untargeted): ${msg.key.id}`);
    }

    // do
    try {
        if (isEmoji(emoji)) {
            await sock.sendMessage(msg.key.remoteJid, {
                react: {
                    text: emoji,
                    key: targetKey
                }
            });
        } else {
            // if the user made a mistake, warn
            if (typeof params === 'string') {
                await sock.sendMessage(msg.key.remoteJid, { text: t('action_reaction_invalid') });
            }
        }
    } catch (error) {
        console.error("❌ Reaction Error:", error.message);
    }
};