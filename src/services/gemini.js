// src/services/gemini.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = (app) => {
    const { config } = app;
    const { t } = app.utils;
    
    const geminiConfig = app.config.AI.gemini;

    const genAI = new GoogleGenerativeAI(geminiConfig.apiKey);
    const model = genAI.getGenerativeModel({
        model: geminiConfig.model,
        generationConfig: { responseMimeType: "application/json" }
    });

    async function getResponse(userMessage) {
        try {
            // system prompt + message
            const fullPrompt = `${config.SYSTEM_PROMPT}\n\nUser Message: ${userMessage}`;

            const result = await model.generateContent(fullPrompt);
            const rawResponse = result.response.text();

            // clear markdown (```json ... ```)
            const cleaned = rawResponse.replace(/```json|```/g, '').trim();
            
            return JSON.parse(cleaned);

        } catch (error) {
            console.error("❌ Gemini Error:", error.message);
            
            return {
                should_reply: true,
                reply_text: t('service_ai_error_general'),
                mood: "error",
                action: null
            };
        }
    }

    return { getResponse };
};