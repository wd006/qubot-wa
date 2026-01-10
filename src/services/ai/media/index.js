// src/services/ai/media/index.js
const hfProvider = require('./providers/hf');
const pollinationsProvider = require('./providers/pollinations');

module.exports = (app) => {
    const { axios } = app.lib;
    const log = app.utils.logger;
    const config = app.config.AI.MEDIA;

    const providers = {
        hf: hfProvider,
        pollinations: pollinationsProvider
    };

    async function generateImage(prompt) {
        const activeProviderName = config.activeProvider;
        const providerFn = providers[activeProviderName];
        const providerConfig = config[activeProviderName];

        if (!providerFn) {
            throw new Error(`AI Media provider '${activeProviderName}' is not defined.`);
        }

        try {
            log.info('AI_MEDIA', `Generating image via ${activeProviderName.toUpperCase()}...`);
            
            const tools = { axios, log };
            
            const result = await providerFn(prompt, providerConfig, tools);
            return result;

        } catch (error) {
            log.error('AI_MEDIA', `${activeProviderName} failed`, error.message);
            throw error;
        }
    }

    return { generateImage };
};