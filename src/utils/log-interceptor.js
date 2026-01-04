// src/utils/logInterceptor.js
const util = require('util');

// word blacklist
const IGNORED_LOGS = [
    'Closing session: SessionEntry',
    'Session error:',
    'Bad MAC',
    'Failed to decrypt',
    'ratchet',
    'preKey',
    'chainKey',
    'identityKey',
    'invalid message',
    'axolotl' 
];

function shouldSilence(args) {
    const msg = util.format(...args);
    return IGNORED_LOGS.some(phrase => msg.includes(phrase));
}

/**
 * It captures console output and blocks those containing specific keywords.
 */
function init() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    console.log = (...args) => {
        if (!shouldSilence(args)) originalLog.apply(console, args);
    };

    console.error = (...args) => {
        if (!shouldSilence(args)) originalError.apply(console, args);
    };

    console.warn = (...args) => {
        if (!shouldSilence(args)) originalWarn.apply(console, args);
    };

    console.info = (...args) => {
        if (!shouldSilence(args)) originalInfo.apply(console, args);
    };
}

module.exports = { init };