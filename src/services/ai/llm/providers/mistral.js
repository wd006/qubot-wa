// src/services/ai/llm/providers/mistral.js
module.exports = async function generate(prompt, systemPrompt, config, tools) {
    const { axios, log } = tools;
    
    const API_URL = 'https://api.mistral.ai/v1/chat/completions';

    const requestBody = {
        model: config.model,
        response_format: { type: "json_object" },
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt } 
        ]
    };

    const requestHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
    };

    const response = await axios.post(API_URL, requestBody, { headers: requestHeaders });
    const rawResponse = response.data.choices[0].message.content;

    if (!rawResponse) {
        throw new Error("Mistral returned a blank answer.");
    }

    // parse json
    return JSON.parse(rawResponse);
};