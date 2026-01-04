// src/utils/msgParser.js

module.exports = (app) => {
    
    /**
     * It extracts the text content of the message according to its type.
     */
    function extractBody(message) {
        if (!message) return "";
        return message.conversation || 
               message.extendedTextMessage?.text || 
               message.imageMessage?.caption || 
               message.videoMessage?.caption ||
               "";
    }

    /**
     * RAW Baileys processes the message and converts it into a clean data object.
     * @param {object} msg - Baileys raw message
     * @returns {object} Normalized message object
     */
    function parse(msg) {
        if (!msg.key) return null;

        // identity informations
        const id = msg.key.id;
        const remoteJid = msg.key.remoteJid;
        const isGroup = remoteJid.endsWith('@g.us');
        const participant = msg.key.participant || remoteJid;
        const fromMe = msg.key.fromMe;
        const pushName = msg.pushName || "Unknown";

        // message content and type
        const messageType = Object.keys(msg.message || {})[0];
        const body = extractBody(msg.message);

        // context info (reply, mention...)
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo || 
                            msg.message?.imageMessage?.contextInfo || 
                            msg.message?.videoMessage?.contextInfo;

        // mention analysis
        const mentionedJids = contextInfo?.mentionedJid || [];
        
        // reply analysis
        let reply = null;
        if (contextInfo && contextInfo.quotedMessage) {
            reply = {
                id: contextInfo.stanzaId,
                participant: contextInfo.participant,
                body: extractBody(contextInfo.quotedMessage),
                isFromMe: contextInfo.participant === app.sock?.user?.id?.split(':')[0] + '@s.whatsapp.net' // (optional)
            };
        }   

        // todo: move the 'is_mentioned' control here.

        return {
            meta: {
                id,
                remoteJid,
                participant,
                pushName,
                isGroup,
                fromMe,
                timestamp: msg.messageTimestamp
            },
            content: {
                type: messageType,
                body: body,
                isMedia: messageType !== 'conversation' && messageType !== 'extendedTextMessage'
            },
            context: {
                mentions: mentionedJids,
                reply: reply,
                isForwarded: contextInfo?.isForwarded || false
            },
            // _raw: msg 
        };
    }

    return { parse };
};