// src/utils/l10n.js

module.exports = (app) => {
    const { fs, path } = app.lib;
    const log = require('./logger');
    const langCode = app.config.LANGUAGE || 'en'; // if not set
    let translations = {};

    try {
        // project_root/locales/lang.json
        const langPath = path.join(app.root, 'locales', `${langCode}.json`);
        
        if (fs.existsSync(langPath)) {
            const rawData = fs.readFileSync(langPath, 'utf8');
            translations = JSON.parse(rawData);
            log.info('UTILS', `l10n: Configured language -> ${langCode}`);
        } else {
            log.warn('UTILS', `l10n: Language file not found (${langCode}.json). Defaults will be used.`);
        }
    } catch (error) {
        log.error('UTILS', "l10n: Language loading error", error.message);
    }

    // translate
    function t(key, placeholders = {}) {
        let text = translations[key] || key; // return key if no value exists.
        
        for (const ph in placeholders) {
            text = text.replace(`{${ph}}`, placeholders[ph]);
        }
        return text;
    }

    // return an object (includes t func)
    return { t };
};