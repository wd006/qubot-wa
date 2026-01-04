// src/actions/reaction.js

function isEmoji(str) {
    if (!str) return false;
    const emojiRegex = /^(\p{Extended_Pictographic}|\p{Emoji_Presentation})/u;
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
    const { t } = app.utils;
    const log = app.utils.logger;

    let emoji;
    let targetMessageId = null;

    if (typeof params === 'string') {
        emoji = params.trim(); 
    } else if (params) {
        emoji = params.emoji;
        targetMessageId = params.message_id;
    }

    if (!emoji) return;

    let targetKey;
    const contextInfo = msg.message?.extendedTextMessage?.contextInfo;

    // ai return with message_id
    if (targetMessageId) {
        // targetMessage =? triggerMessage
        if (targetMessageId === msg.key.id) {
            targetKey = msg.key;
        } else {
            
            targetKey = {
                remoteJid: msg.key.remoteJid,
                id: targetMessageId
            };

            if (contextInfo && contextInfo.stanzaId === targetMessageId) {
                targetKey.participant = contextInfo.participant;
            }
        }
        log.info('ACTIONS', 'react: AI Targeted', `Reacting to: ${targetMessageId}`);
    }
    // !react
    else if (typeof params === 'string' && contextInfo && contextInfo.stanzaId) {
        targetKey = {
            remoteJid: msg.key.remoteJid,
            id: contextInfo.stanzaId,
            participant: contextInfo.participant // for groups
        };
        log.info('ACTIONS', 'react: User Replied with Command', `Reacting to: ${contextInfo.stanzaId}`);
    }
    // no target, react to trigger msg
    else {
        targetKey = msg.key;
        log.info('ACTIONS', 'react: AI Untargeted (Trigger Msg)', `Reacting to: ${msg.key.id}`);
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
            if (typeof params === 'string') {
                await sock.sendMessage(msg.key.remoteJid, { text: t('action_reaction_error_usage') });
            }
        }
    } catch (error) {
        log.error('ACTIONS', "react: An error occured", error.message);
    }
};