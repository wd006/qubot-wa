// src/services/mistral.js

module.exports = (app) => {
    const { axios } = app.lib;
    const { config } = app;
    const { t } = app.utils;

    const mistralConfig = app.config.AI.mistral; 


    const API_URL = 'https://api.mistral.ai/v1/chat/completions';

    async function getResponse(prompt) {
        try {
            const requestBody = {
                model: mistralConfig.model,
                response_format: { type: "json_object" }, // JSON mode
                messages: [
                    { role: "system", content: config.SYSTEM_PROMPT },
                    { role: "user", content: prompt }
                ]
            };

            const requestHeaders = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${mistralConfig.apiKey}`
            };

            // app.lib.axios
            const response = await axios.post(API_URL, requestBody, { headers: requestHeaders });

            const rawResponse = response.data.choices[0].message.content;

            if (!rawResponse) {
                throw new Error("Mistral returned a blank reply.");
            }

            return JSON.parse(rawResponse);

        } catch (error) {
            console.error("❌ Mistral Error:", error.response ? error.response.data : error.message);
            
            let errorMessage = t('service_ai_error_general');
            
            // 401: API Key error
            if (error.response?.status === 401) {
                errorMessage = t('service_ai_error_apikey');
            } 
            // 429: rate limit
            else if (error.response?.status === 429) {
                errorMessage = t('service_ai_error_ratelimit');
            }

            // return safe answer if there is an error
            return { 
                should_reply: true,
                reply_text: errorMessage, 
                mood: "error", 
                action: null 
            };
        }
    }

    return { getResponse };
};