// src/actions/image.js
module.exports.command = {
    name: 'img',
    aliases: ['resim', 'image', 'ciz', 'imagine'],
    description: 'action_image_desc',
    usage: '<ne_cizilsin>'
};

module.exports.actionName = 'generate_image';

module.exports.execute = async function (sock, msg, params, app) {
    const { axios } = app.lib;
    const { t, logger: log } = app.utils;

    let prompt = '';
    if (typeof params === 'string') {
        prompt = params.trim();
    } else {
        prompt = params.prompt;
    }

    if (!prompt) {
        // empty !img
        await sock.sendMessage(msg.key.remoteJid, { text: t('action_image_error_usage') || '❌ Ne çizmem gerektiğini söylemelisin. Örn: !img uçan kedi' }, { quoted: msg });
        return;
    }

    try {
        // randomization with seed
        const seed = Math.floor(Math.random() * 1000000);
        // no api img-generator
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;

        log.info('ACTIONS', 'img: Generating image for prompt:', prompt);

        // download img (as a buffer)
        const response = await axios.get(url, { responseType: 'arraybuffer' });

        // send
        await sock.sendMessage(msg.key.remoteJid, { 
            image: response.data,
            caption: `🎨 *${prompt}*`
        }, { quoted: msg });

    } catch (error) {
        log.error('ACTIONS', 'img: Generation failed', error.message);
        await sock.sendMessage(msg.key.remoteJid, { text: t('action_gen-image_error_general') }, { quoted: msg });
    }
};