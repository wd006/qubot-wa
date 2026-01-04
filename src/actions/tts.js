// src/actions/tts.js

module.exports.command = {
    name: 'tts',
    aliases: ['speak', 'speech', 'konus', 'soyle'],
    description: 'action_tts_desc',
    usage: '[dil_kodu] <metin>'
};

module.exports.actionName = 'send_voice_message';

module.exports.execute = async function (sock, msg, params, app) {
    const { axios } = app.lib;
    const { t } = app.utils;
    const log = app.utils.logger;

    let textToSpeak = '';
    let lang = app.config.LANGUAGE; // default lang from config

    if (typeof params === 'string') {
        // !tts en Hello world -> from user
        let args = params.split(' ');

        // find language code
        if (args.length > 1 && args[0].length === 2) {
            lang = args.shift();
        }
        textToSpeak = args.join(' ');

    } else {
        // { text: "Hello world", lang: "en" } -> from ai
        textToSpeak = params.text;
        lang = params.lang || lang;
    }

    if (!textToSpeak) {
        await sock.sendMessage(msg.key.remoteJid, { text: t('action_tts_error_usage') });
        return;
    }

    try {
        // Google Translate TTS API 
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(textToSpeak)}&tl=${lang}&client=tw-ob`;

        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' },
            responseType: 'arraybuffer'
        });
        
        await sock.sendMessage(msg.key.remoteJid, {
            audio: Buffer.from(response.data),
            mimetype: 'audio/ogg; codecs=opus',
            ptt: false // like voice record
        });

    } catch (error) {
        log.error('ACTIONS',"tts: An error occured", error.message);
        if (error.response && error.response.status === 400) {
            await sock.sendMessage(msg.key.remoteJid, { text: t('action_tts_error_lang', { lang }) });
        } else {
            await sock.sendMessage(msg.key.remoteJid, { text: t('action_tts_error_general') });
        }
    }
};