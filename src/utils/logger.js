// src/utils/logger.js
const util = require('util');
const config = require('../config');

const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
};

const timestamp = () => `\x1b[90m[${new Date().toLocaleTimeString()}]\x1b[0m`;
const tag = (label, color) => `${color}[${label.toUpperCase()}]${colors.reset}`;

// Objeleri basmak için yardımcı (Sadece nesneler için çalışır)
const printObjects = (args) => {
    args.forEach(arg => {
        if (typeof arg === 'object' && arg !== null) {
            console.log(util.inspect(arg, { colors: true, depth: null, compact: false }));
        }
    });
};

const logger = {
    // Genel Yazdırma Fonksiyonu (DRY - Don't Repeat Yourself)
    _print: (category, color, message, args) => {
        // Metin olan argümanları ana mesajla birleştir (Aynı satırda kalsın)
        const textArgs = args.filter(a => typeof a !== 'object').join(' ');
        const finalMessage = textArgs ? `${message} ${textArgs}` : message;

        console.log(`${timestamp()} ${tag(category, color)} ${finalMessage}`);

        // Sadece objeleri alt satıra bas
        const objArgs = args.filter(a => typeof a === 'object');
        printObjects(objArgs);
    },

    info: (category, message, ...args) => logger._print(category, colors.blue, message, args),
    success: (category, message, ...args) => logger._print(category, colors.green, message, args),
    warn: (category, message, ...args) => logger._print(category, colors.yellow, message, args),

    error: (category, message, ...args) => {
        console.error(`${timestamp()} ${tag(category, colors.red)} ${message}`);
        // Hata durumunda her şeyi detaylı bas
        args.forEach(arg => console.error(arg));
    },

    debug: (category, message, ...args) => {
        if (config.DEBUG) {
            console.log(`${timestamp()} ${tag(category, colors.magenta)} ${colors.dim}${message}${colors.reset}`);
            args.forEach(arg => console.log(util.inspect(arg, { colors: true, compact: true })));
        }
    },

    // --- KUTULAR (Aynı Kalıyor - Temiz Görüntü İçin) ---
    incoming: (parsedMsg) => {
        if (!parsedMsg) return;
        const { meta, content, context } = parsedMsg;

        console.log(`\n${colors.cyan}┌── 📥 INCOMING ${new Date().toLocaleTimeString()} ──────────────────────────┐${colors.reset}`);
        console.log(`│ ${colors.yellow}From:${colors.reset}    ${meta.pushName} (${meta.participant.split('@')[0]})`);
        if (meta.isGroup) console.log(`│ ${colors.yellow}Chat:${colors.reset}    Group (${meta.remoteJid.split('@')[0]})`);

        const typeLabel = content.isMedia ? `[${content.type}]` : '';
        const cleanBody = content.body ? content.body.replace(/\n/g, ' ') : '';
        console.log(`│ ${colors.yellow}Body:${colors.reset}    ${colors.white}${typeLabel} ${cleanBody}${colors.reset}`);

        if (context.isForwarded) console.log(`│ ${colors.magenta}Info:${colors.reset}    ↪️ Forwarded Message`);
        if (context.reply) console.log(`│ ${colors.magenta}Reply:${colors.reset}   ↩️ Replying to ${context.reply.participant.split('@')[0]}`);
        if (context.mentions.length > 0) console.log(`│ ${colors.magenta}Tags:${colors.reset}    @ Mentioned ${context.mentions.length} user(s)`);

        console.log(`${colors.cyan}└────────────────────────────────────────────────────────┘${colors.reset}`);
    },

    decision: (decision) => {
        const { thought, should_reply, reply_text, mood, action } = decision;
        const boxColor = should_reply ? colors.green : (action ? colors.magenta : colors.dim);
        const title = should_reply ? 'AI SPEAKING' : (action ? 'AI ACTION' : 'AI SILENT');

        console.log(`${boxColor}┌── 🧠 ${title} ─────────────────────────────────┐${colors.reset}`);
        console.log(`│ ${colors.yellow}Mood:${colors.reset}     ${mood || 'Neutral'}`);
        console.log(`│ ${colors.yellow}Thought:${colors.reset}  ${colors.dim}${thought}${colors.reset}`);

        if (should_reply) {
            console.log(`│ ${colors.yellow}Reply:${colors.reset}    ${colors.white}${reply_text}${colors.reset}`);
        }

        if (action) {
            console.log(`│ ${colors.yellow}Action:${colors.reset}   🚀 ${action.type}`);
            const params = JSON.stringify(action.params);
            console.log(`│ ${colors.yellow}Params:${colors.reset}   ${colors.dim}${params}${colors.reset}`);
        }
        console.log(`${boxColor}└────────────────────────────────────────────────────────┘${colors.reset}`);
    },

    box: (title, data, colorKey = 'cyan') => {
        const color = colors[colorKey] || colors.cyan;
        console.log(`\n${color}┌── 📦 ${title.toUpperCase()} ──────────────────────────────┐${colors.reset}`);
        const jsonLines = util.inspect(data, { colors: true, depth: null, compact: false }).split('\n');
        jsonLines.forEach(line => {
            console.log(`${color}│${colors.reset} ${line}`);
        });
        console.log(`${color}└────────────────────────────────────────────────────────┘${colors.reset}`);
    }
};

module.exports = logger;