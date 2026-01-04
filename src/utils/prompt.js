// src/utils/prompt.js

module.exports = (app) => {
    const { fs, path } = app.lib;
    const log = require('./logger');

    // *.prompt's
    let systemInstruction = "";

    function loadFile(fileName) {
        try {
            const filePath = path.join(app.root, 'prompts', fileName);
            if (!fs.existsSync(filePath)) return '';
            const content = fs.readFileSync(filePath, 'utf8');
            return content.replace(/<!--[\s\S]*?-->/g, '').trim(); 
        } catch (e) {
            log.error('UTILS', `prompt: Prompt file can not read: ${fileName}`, e.message);
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
        log.success('UTILS', "prompt: Prompt files are ready");
    }

    // load initally
    init();

    // dynamic context from message
    async function build(sock, msg) {
        // parser
        const parsedMsg = app.utils.parser.parse(msg);
        log.debug('PARSE MSG', 'Output:', parsedMsg);
        if (!parsedMsg) return ""; // return blank on error

        const { meta, content, context } = parsedMsg;
        const { LOCALE } = app.config;

        // date-time
        const now = new Date();
        const timeStr = now.toLocaleString(LOCALE, { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });

        // group info
        let sourceInfo = meta.isGroup ? "Group Chat" : "Direct Message (DM)";
        if (meta.isGroup) {
            let groupName = app.cache.groupNames.get(meta.remoteJid); // caching
            if (!groupName) {
                try {
                    const metadata = await sock.groupMetadata(meta.remoteJid);
                    groupName = metadata.subject;
                    app.cache.groupNames.set(meta.remoteJid, groupName);
                } catch (e) { groupName = "Unknown Group"; }
            }
            sourceInfo += `\nGroup Name: "${groupName}"`;
        }

        // bot identity, target analysiz
        const rawBotId = sock.user?.id || "";
        const botIdClean = rawBotId.split(':')[0].split('@')[0];
        const senderNumber = meta.participant.split('@')[0];

        // mentioned
        const isExplicitlyMentioned = context.mentions.some(jid => jid.includes(botIdClean));

        // replied (from parser)
        let isReplyToBot = false;
        let quotedBlock = "";

        if (context.reply) {
            const replySenderNum = context.reply.participant.split('@')[0];
            
            // reply to bot?
            if (replySenderNum === botIdClean) {
                isReplyToBot = true;
            }

            const qOwner = isReplyToBot ? "YOU (Your earlier message)" : `User (+${replySenderNum})`;
            quotedBlock = `\n\n--- REPLIED MESSAGE ---\nAuthor: ${qOwner}\nContent: "${context.reply.body}"\nMessage ID: ${context.reply.id}\n-----------------------`;
        }

        const attentionStatus = (isExplicitlyMentioned || isReplyToBot) ? "YES (Priority)" : "NO";

        // msg content note
        let mediaNote = "";
        if (content.isMedia) {
            mediaNote = `[User sent a ${content.type.replace('Message', '').toUpperCase()}] `;
        }

        const finalPrompt = `
=== [ 🌍 SYSTEM INFO ] ===
Time: ${timeStr}

=== [ 📍 CONTEXT ] ===
Type: ${sourceInfo}
Sender: ${meta.pushName} (+${senderNumber})
Message ID: ${meta.id}
Targeted to You: ${attentionStatus}
Is Forwarded: ${context.isForwarded ? "YES" : "NO"}

=== [ 💬 USER MESSAGE ] ===
${mediaNote}CONTENT: "${content.body}"${quotedBlock}
`.trim();

        return finalPrompt;
    }

    return {
        getSystemPrompt: () => systemInstruction,
        build
    };
};