// src/utils/prompt.js

module.exports = (app) => {
    const { fs, path } = app.lib;
    
    // *.prompt's
    let systemInstruction = "";

    function loadFile(fileName) {
        try {
            const filePath = path.join(app.root, 'prompts', fileName);
            if (!fs.existsSync(filePath)) return '';
            const content = fs.readFileSync(filePath, 'utf8');
            return content.replace(/<!--[\s\S]*?-->/g, '').trim(); 
        } catch (e) {
            console.error(`⚠️ Prompt can not read: ${fileName}`, e.message);
            return "";
        }
    }

    function init() {
        const pCore = loadFile('core.prompt');
        const pActions = loadFile('actions.prompt');
        const pPersona = fs.existsSync(path.join(app.root, 'prompts', 'persona.prompt'))
            ? loadFile('persona.prompt')
            : loadFile('persona.prompt.example'); // if the file has not been renamed

        systemInstruction = `${pCore}\n\n${pActions}\n\n${pPersona}`;
        console.log("✅ Prompt files are ready");
    }

    // load initally
    init();

    // dynamic context from message
    async function build(sock, msg) {
        const { LOCALE } = app.config;
        const chatId = msg.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        // sender = group -> participant, dm -> remoteJid
        const senderJid = msg.key.participant || chatId;

        // date-time
        const now = new Date();
        const timeStr = now.toLocaleString(LOCALE, { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });

        // bot id, sender infos
        // clean bot id (1xxx:12@s.whatsapp.net -> 1xxx)
        const rawBotId = sock.user?.id || "";
        const botIdClean = rawBotId.split(':')[0].split('@')[0]; 
        const senderIdClean = senderJid.split(':')[0].split('@')[0];

        // group info (caching system)
        let sourceInfo = isGroup ? "Group Chat" : "Direct Message (DM)";
        if (isGroup) {
            let groupName = app.cache.groupNames.get(chatId);
            // if it's not cached -> retrieve and save
            if (!groupName) {
                try {
                    const metadata = await sock.groupMetadata(chatId);
                    groupName = metadata.subject;
                    app.cache.groupNames.set(chatId, groupName);
                } catch (e) { groupName = "Unknown Group"; }
            }
            sourceInfo += `\nGroup Name: "${groupName}"`;
        }

        const senderName = msg.pushName || "Unknown User";
        const messageId = msg.key.id;

        // (MENTION, REPLY, FORWARD)
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo || 
                            msg.message?.imageMessage?.contextInfo || 
                            msg.message?.videoMessage?.contextInfo;

        // tagged?
        const mentions = contextInfo?.mentionedJid || [];
        const isExplicitlyMentioned = mentions.some(jid => jid.includes(botIdClean));

        // forwarded?
        const isForwarded = contextInfo?.isForwarded || false;

        // replied?
        let isReplyToBot = false;
        let quotedBlock = "";

        if (contextInfo && contextInfo.quotedMessage) {
            const quotedParticipant = contextInfo.participant || ""; 
            const quotedParticipantClean = quotedParticipant.split(':')[0].split('@')[0];

            // replied to bot?
            if (quotedParticipantClean === botIdClean) {
                isReplyToBot = true;
            }

            const qMsg = contextInfo.quotedMessage;
            const qBody = qMsg.conversation || qMsg.extendedTextMessage?.text || "[Media/Other]";
            
            // say to bot
            const qOwner = isReplyToBot ? "YOU (Your earlier message)" : `User (+${quotedParticipantClean})`;
            
            quotedBlock = `\n\n--- REPLIED MESSAGE ---\nAuthor: ${qOwner}\nContent: "${qBody}"\n-----------------------`;
        }

        // should bot talk?
        const attentionStatus = (isExplicitlyMentioned || isReplyToBot) ? "YES (Priority)" : "NO";

        // message content
        const messageType = Object.keys(msg.message)[0];
        let content = "";
        let mediaNote = "";

        if (messageType === 'conversation') {
            content = msg.message.conversation;
        } else if (messageType === 'extendedTextMessage') {
            content = msg.message.extendedTextMessage.text;
        } else if (messageType === 'imageMessage') {
            content = msg.message.imageMessage.caption || "";
            mediaNote = "[User sent an IMAGE]";
        } else if (messageType === 'audioMessage') {
            mediaNote = "[User sent a VOICE NOTE]";
        } else if (messageType === 'stickerMessage') {
            mediaNote = "[User sent a STICKER]";
        }


        const finalPrompt = `
=== [ 🌍 SYSTEM INFO ] ===
Time: ${timeStr}

=== [ 📍 CONTEXT ] ===
Type: ${sourceInfo}
Sender: ${senderName} (+${senderIdClean})
Message ID: ${messageId}
Targeted to You: ${attentionStatus}
Is Forwarded: ${isForwarded ? "YES" : "NO"}

=== [ 💬 USER MESSAGE ] ===
${mediaNote ? `TYPE: ${mediaNote}\n` : ''}CONTENT: "${content}"${quotedBlock}
`.trim();

        return finalPrompt;
    }

    return {
        getSystemPrompt: () => systemInstruction,
        build
    };
};