const axios = require('axios');

module.exports.command = {
    name: 'tts',
    aliases: ['konus', 'soyle', 'speak'],
    description: 'Converts text to speech. Example: !speak en Hello World',
    usage: '[lang_code] <text>' // lang optional
};

// ai action name
module.exports.actionName = 'send_voice_message';

module.exports.execute = async function(sock, msg, params) {
    let textToSpeak = '';
    let lang = 'en'; // default lang

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
        await sock.sendMessage(msg.key.remoteJid, { text: "You didn't write what you wanted me to say." });
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
        if (error.response && error.response.status === 404) {
             await sock.sendMessage(msg.key.remoteJid, { text: `"${lang}" I don't support the this language code or you typed it incorrectly.. 🤷‍♂️` });
        } else {
            await sock.sendMessage(msg.key.remoteJid, { text: "I have a problem with my vocal cords, I can't speak right now. 🤒" });
        }
    }
};