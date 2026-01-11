// src/actions/translate.js
const { translate } = require('google-translate-api-x');

module.exports.command = {
    name: 'translate',
    aliases: ['ceviri'],
    description: 'action_translate_desc',
    usage: '[source_lang] <target_lang> <text>'
};

module.exports.actionName = 'translate_text';

// lang code control (2 letters)
function isLangCode(str) {
    return str && str.length === 2 && /^[a-zA-Z]+$/.test(str);
}

module.exports.execute = async function (sock, msg, params, app) {
    const { t } = app.utils;

    // DEFAULTS
    let sourceLang = 'auto';
    let targetLang = 'en';
    let textToTranslate = '';

    // parameter parsing
    if (typeof params === 'string') {
        // !translate -> from user
        const args = params.trim().split(/ +/); // spaces
        
        // !translate en es Hello (3+ arguments, the first two are lang code)
        if (args.length >= 3 && isLangCode(args[0]) && isLangCode(args[1])) {
            sourceLang = args[0];
            targetLang = args[1];
            textToTranslate = args.slice(2).join(' ');
        }
        // !translate es Hello (2+ arguments, only the first one is the lang code)
        else if (args.length >= 2 && isLangCode(args[0])) {
            sourceLang = 'auto';
            targetLang = args[0];
            textToTranslate = args.slice(1).join(' ');
        }
        // usage error
        else {
            await sock.sendMessage(msg.key.remoteJid, { text: t('action_translate_error_usage') }, { quoted: msg });
            return;
        }

    } else {
        // from ai
        textToTranslate = params.text;
        targetLang = params.to || 'en';
        sourceLang = params.from || 'auto';
    }

    if (!textToTranslate) {
        await sock.sendMessage(msg.key.remoteJid, { text: t('action_translate_error_notext') }, { quoted: msg });
        return;
    }

    // reaction
    await sock.sendMessage(msg.key.remoteJid, { react: { text: '🔄', key: msg.key } });

    try {
        // translate options
        const options = { 
            to: targetLang,
            autoCorrect: true 
        };
        
        // add source lang if not 'auto'
        if (sourceLang !== 'auto') {
            options.from = sourceLang;
        }

        const res = await translate(textToTranslate, options);

        // prepare result
        // res.from.language.iso -> if 'auto' is used, it will return the detected language
        const detected = res.from.language.iso;
        const finalSource = (sourceLang === 'auto' ? detected : sourceLang).toUpperCase();
        const finalTarget = targetLang.toUpperCase();

        const responseText = `🌍 *${t('action_translate_header')} (${finalSource} ➔ ${finalTarget})*\n\n${res.text}`; //Translation

        await sock.sendMessage(msg.key.remoteJid, { text: responseText }, { quoted: msg });

    } catch (error) {
        let errText = t('action_translate_error_general'); 
        if (error.code === 400) errText += ` (${t('action_translate_error_lang')})`;
        
        await sock.sendMessage(msg.key.remoteJid, { text: errText }, { quoted: msg });
    }
};