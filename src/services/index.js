// src/services/index.js

const mistralLoader = require('./mistral');
const geminiLoader = require('./gemini');

module.exports = (app) => {
    // load services with app
    const mistral = mistralLoader(app);
    const gemini = geminiLoader(app);


    
    return {
        mistral,
        gemini,
        // todo: upgrade active ai provider selector
        active: app.config.AI_PROVIDER === 'gemini' ? gemini : mistral
    };
};