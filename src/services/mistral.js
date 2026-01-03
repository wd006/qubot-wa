// src/services/mistral.js

module.exports = (app) => {
    const { axios } = app.lib;
    const { t } = app.utils;

    const mistralConfig = app.config.AI.mistral; 

    const API_URL = 'https://api.mistral.ai/v1/chat/completions';

    async function getResponse(richPrompt) {
        try {

            const requestBody = {
                model: mistralConfig.model,
                response_format: { type: "json_object" },
                messages: [
                    // *.prompt's
                    { role: "system", content: app.utils.prompt.getSystemPrompt() },

                    // dynamic context from messages
                    { role: "user", content: richPrompt } 
                ]
            };

            const requestHeaders = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${mistralConfig.apiKey}`
            };
            //console.log('Sending to AI:'); // debugging
            //console.log(requestBody); // debugging
            const response = await axios.post(API_URL, requestBody, { headers: requestHeaders });
            const rawResponse = response.data.choices[0].message.content;

            if (!rawResponse) {
                throw new Error("Mistral returned a blank answer.");
            }

            return JSON.parse(rawResponse);

        } catch (error) {
            console.error("❌ Mistral Error:", error.response ? error.response.data : error.message);
            
            let errorMessage = t('service_ai_error_general');
            if (error.response?.status === 401) errorMessage = t('service_ai_error_apikey');
            else if (error.response?.status === 429) errorMessage = t('service_ai_error_ratelimit');

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