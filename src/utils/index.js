const logger = require('./logger');
const l10n = require('./l10n');

module.exports = {
    // from logger.js
    logIncomingMessage: logger.logIncomingMessage,
    logAIDecision: logger.logAIDecision,
    logAction: logger.logAction,

    // from l10n.js
    t: l10n.t,
};