// src/utils/logger.js

const colors = {
    reset: "\x1b[0m",
    cyan: "\x1b[36m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    dim: "\x1b[2m",
};

function logIncomingMessage(msg) {
    const sender = msg.key.participant || msg.key.remoteJid;
    const isGroup = msg.key.remoteJid.endsWith('@g.us');
    const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "[Media/Other]";
    const senderName = msg.pushName || "Unknown";

    console.log(`\n${colors.cyan}┌── 📥 INCOMING ${new Date().toLocaleTimeString()} ───────────┐${colors.reset}`);
    console.log(`│ ${colors.yellow}From:${colors.reset}   ${senderName} (${sender.split('@')[0]})`);
    if (isGroup) {
        console.log(`│ ${colors.yellow}Group ID:${colors.reset}  ${msg.key.remoteJid.split('@')[0]}`);
    }
    console.log(`│ ${colors.yellow}Content:${colors.reset}   ${body}`);
    console.log(`${colors.cyan}└────────────────────────────────────────────────┘${colors.reset}`);
}

function logAIDecision(decision) {
    const { thought, should_reply, reply_text, mood, action } = decision;
    const boxColor = should_reply ? colors.green : colors.red;

    console.log(`${boxColor}┌── 🧠 AI DECISION ────────────────────────────┐${colors.reset}`);
    console.log(`│ ${colors.yellow}Düşünce:${colors.reset} ${colors.dim}${thought}${colors.reset}`);
    
    if (should_reply) {
        console.log(`│ ${colors.yellow}Decision:${colors.reset}    ✅ ${colors.green}TALK${colors.reset}`);
        console.log(`│ ${colors.yellow}Response:${colors.reset}    ${reply_text}`);
    } else {
        console.log(`│ ${colors.yellow}Decision:${colors.reset}    ❌ ${colors.red}SILENT${colors.reset}`);
    }
    
    if (action) {
        const params = action.params ? JSON.stringify(action.params) : "None";
        console.log(`│ ${colors.yellow}Action:${colors.reset}  ⚙️ ${action.type} | Params: ${params}`);
    }
    console.log(`${boxColor}└────────────────────────────────────────────────┘${colors.reset}`);
}

module.exports = { logIncomingMessage, logAIDecision };