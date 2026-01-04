// src/utils/index.js
const l10nLoader = require('./l10n');
const logger = require('./logger');
const parserLoader = require('./msgParser');
const promptLoader = require('./prompt');

module.exports = (app) => {
    const l10n = l10nLoader(app);
    const parser = parserLoader(app);
    const promptManager = promptLoader(app);

    return {
        ...logger,
        t: l10n.t,
        parser: parser,
        prompt: promptManager
    };
};