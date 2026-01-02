const fs = require('fs');
const path = require('path');
const config = require('../config');

// caching
let translations = {};

try {
    const langFilePath = path.join(__dirname, `../../locales/${config.LANGUAGE}.json`);
    translations = JSON.parse(fs.readFileSync(langFilePath, 'utf8'));
    console.log(`✅ Language loaded: ${config.LANGUAGE}.json`);
} catch (error) {
    console.error(`❌ CRITIC ERROR: ${config.LANGUAGE}.json language file could not be read!`, error);
    // To prevent the bot from crashing in case of an error, continue with an empty object.
}

/**
 * It retrieves the translation of the specified key and fills in the placeholders.
 * @param {string} key - lang_code.json the key inside (e.g., 'error_tts_general')
 * @param {object} [placeholders={}] - Dynamic values ​​to be modified (e.g., { lang: 'de' })
 * @returns {string} Translated text
 */
function t(key, placeholders = {}) {
    let text = translations[key] || key; // Eğer anahtar yoksa, anahtarın kendisini döndür (hata ayıklama için)

    for (const placeholder in placeholders) {
        text = text.replace(`{${placeholder}}`, placeholders[placeholder]);
    }
    
    return text;
}

module.exports = { t };