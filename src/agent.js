const config = require('./config');
const helpers = require('./utils');
const gemini = require('./services/gemini');
const mistral = require('./services/mistral');

async function processMessage(userMessage, senderName) {

    const finalPrompt = `Username: ${senderName}\nMessage: "${userMessage}"`;

    try {
        if (config.AI_PROVIDER === 'mistral') {
            console.log("🧠 Mistral AI...");
            return await mistral.getResponse(finalPrompt);
        } else {
            // gemini: default
            console.log("🧠 Gemini AI...");
            const geminiPrompt = `${config.SYSTEM_PROMPT}\n\n${finalPrompt}`;
            return await gemini.getResponse(geminiPrompt);
        }
    } catch (error) {
        console.error(`❌ ${config.AI_PROVIDER.toUpperCase()} Agent Error:`, error.message);
        return { 
            should_reply: true,
            reply_text: helpers.t('general_error'), 
            mood: "error", 
            action: null 
        };
    }
}

module.exports = { processMessage };