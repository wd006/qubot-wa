// src/services/index.js (Önerilen Hali)
const mistralLoader = require('./mistral');
const geminiLoader = require('./gemini');

module.exports = (app) => {
    const log = app.utils.logger;
    
    const services = {
        mistral: mistralLoader(app),
        gemini: geminiLoader(app)
    };

    const activeProviderName = app.config.AI.activeProvider;
    const activeService = services[activeProviderName];

    if (!activeService) {
        log.error('BOOT', `Active AI provider "${activeProviderName}" not found in services!`);
        process.exit(1); // faulty config -> crash the bot
    }

    return {
        ...services, // all ai services
        active: activeService
    };
};