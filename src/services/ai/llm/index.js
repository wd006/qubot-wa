// src/services/ai/llm/index.js
const mistralProvider = require('./providers/mistral');
const geminiProvider = require('./providers/gemini');

module.exports = (app) => {
    const { axios } = app.lib;
    const { t } = app.utils;
    const log = app.utils.logger;
    const config = app.config.AI.LLM;

    const providers = {
        mistral: mistralProvider,
        gemini: geminiProvider
    };

    async function getResponse(richPrompt) {
        const activeProviderName = config.activeProvider;
        const providerFn = providers[activeProviderName];
        const providerConfig = config[activeProviderName];

        if (!providerFn) {
            log.error('AI_LLM', `Provider '${activeProviderName}' is not defined.`);
            return { should_reply: true, reply_text: t('service_ai_error_general'), mood: "error" };
        }

        try {
            // get system prompt
            const systemPrompt = app.utils.prompt.getSystemPrompt();
            
            const tools = { axios, log };

            // call provider
            const response = await providerFn(richPrompt, systemPrompt, providerConfig, tools);
            return response;

        } catch (error) {
            log.error('AI_LLM', `${activeProviderName} error`, error.message);
            
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