// src/services/ai/llm/providers/gemini.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function generate(prompt, systemPrompt, config, tools) {
    const { log } = tools;

    const genAI = new GoogleGenerativeAI(config.apiKey);
    const model = genAI.getGenerativeModel({
        model: config.model,
        generationConfig: { responseMimeType: "application/json" }
    });

    const fullPrompt = `${systemPrompt}\n\n${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const rawResponse = result.response.text();

    // md cleaning
    const cleaned = rawResponse.replace(/```json|```/g, '').trim();
    
    return JSON.parse(cleaned);
};