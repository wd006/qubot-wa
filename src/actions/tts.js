const axios = require('axios');
const config = require('../config.js');

module.exports.command = {
    name: 'tts',
    aliases: ['speak', 'speech', 'konus', 'soyle'],
    description: 'action_tts_desc',
    usage: '[lang_code] <text>' // lang optional
};

// ai action name
module.exports.actionName = 'send_voice_message';

module.exports.execute = async function(sock, msg, params, helpers) {
    let textToSpeak = '';
    let lang = config.LANGUAGE; // default lang

    // command or ai?
    if (typeof params === 'string') {
        // !tts en Hello -> from user
        let args = params.split(' ');
        
        // is the language code specified?
        if (args.length > 1 && args[0].length === 2) {
            lang = args.shift(); // set lang
        }
        textToSpeak = args.join(' '); // text
        
    } else {
        // { text: "...", lang: "..." } -> from ai
        textToSpeak = params.text;
        lang = params.lang || lang; // if it's not exist, use default
    }

    if (!textToSpeak) {
        await sock.sendMessage(msg.key.remoteJid, { text: helpers.t('action_tts_error_usage') });
        return;
    }

    try {
        // Create a Google Translate URL using dynamic 'lang'.
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(textToSpeak)}&tl=${lang}&client=tw-ob`;
        
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            responseType: 'arraybuffer'
        });

        await sock.sendMessage(msg.key.remoteJid, {
            audio: Buffer.from(response.data),
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
        });

    } catch (error) {
        console.error("❌ TTS Error:", error.message);
        if (error.response && error.response.status === 400) {
             await sock.sendMessage(msg.key.remoteJid, { text: helpers.t('action_tts_error_lang', {lang: lang}) });
        } else {
            await sock.sendMessage(msg.key.remoteJid, { text: helpers.t('action_tts_error_general') });
        }
    }
};