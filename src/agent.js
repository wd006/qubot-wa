const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require('./config');

// launch ai service
const genAI = new GoogleGenerativeAI(config.GEMINI_KEY);
const model = genAI.getGenerativeModel({ 
    model: config.GEMINI_MODEL,
    generationConfig: {
        responseMimeType: "application/json" // Native JSON mode
    }
});

// Helper: JSON Cleaner
function cleanJson(text) {
    // it cleans up any markdown code blocks, if any. (```json ... ```)
    return text.replace(/```json|```/g, '').trim();
}

async function processMessage(userMessage, senderName) {
    try {
        // prepare prompt
        const finalPrompt = `${config.SYSTEM_PROMPT}

Username: ${senderName}
Message: "${userMessage}"`;

        // send request
        const result = await model.generateContent(finalPrompt);
        const rawResponse = result.response.text();

        // parse and return
        const jsonResponse = JSON.parse(cleanJson(rawResponse));
        return jsonResponse;

    } catch (error) {
        console.error("❌ Agent Error:", error.message);
        
        // if there is an error, return safe answer
        return { 
            should_reply: true,
            reply_text: '❌ Oops! 🤖 Dude, I\'m having some problems right now! 🔧 Please try again later.', 
            mood: "error", 
            action: null 
        };
    }
}

module.exports = { processMessage };