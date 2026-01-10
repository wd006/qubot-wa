// src/services/ai/index.js
const llmLoader = require('./llm');
const mediaLoader = require('./media');

module.exports = (app) => {
    return {
        llm: llmLoader(app),    // app.services.ai.llm
        media: mediaLoader(app) // app.services.ai.media
    };
};