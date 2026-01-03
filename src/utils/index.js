// src/utils/index.js
const logger = require('./logger');
const l10nLoader = require('./l10n');
const promptLoader = require('./prompt');

module.exports = (app) => {
    // load l10n with 'app'
    const l10n = l10nLoader(app);
    const promptManager = promptLoader(app);

    return {
        ...logger, // logIncomingMessage and logAIDecision
        t: l10n.t,  // t (l10n)
        prompt: promptManager
    };
};