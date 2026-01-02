const axios = require('axios');
const config = require('../config.js');

module.exports.command = {
    name: 'wiki',
    aliases: ['wikipedia', 'bilgi', 'info'],
    description: 'action_wiki_desc'
};

// ai action name
module.exports.actionName = 'wikipedia_search';


module.exports.execute = async function(sock, msg, params, helpers) {

    const query = typeof params === 'string' ? params : params.query;
    const lang = config.LANGUAGE;

    if (!query) {
        await sock.sendMessage(msg.key.remoteJid, { text: helpers.t('action_wiki_error_usage') });
        return;
    }

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
    };

    try {
        // search
        const searchUrl = `https://${lang}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&namespace=0&format=json`;
        const searchResponse = await axios.get(searchUrl, { headers });
        
        const pageTitle = searchResponse.data[1][0];
        
        if (!pageTitle) {
            await sock.sendMessage(msg.key.remoteJid, { text: helpers.t('action_wiki_error_notFound') });
            return;
        }

        // get summary
        const summaryUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&redirects=1&format=json&titles=${encodeURIComponent(pageTitle)}`;
        const summaryResponse = await axios.get(summaryUrl, { headers });
        
        const pages = summaryResponse.data.query.pages;
        const pageId = Object.keys(pages)[0];
        const extract = pages[pageId].extract;

        if (!extract) {
            await sock.sendMessage(msg.key.remoteJid, { text: helpers.t('action_wiki_error_summary') });
            return;
        }
        
        // result
        const resultText = `
📖 *${helpers.t('action_wiki_header')}: ${pageTitle}*

${extract.substring(0, 500)}...

${helpers.t('action_wiki_goLink')}: ${searchResponse.data[3][0]}`;

        await sock.sendMessage(msg.key.remoteJid, { text: resultText.trim() });

    } catch (error) {
        console.error("❌ Wikipedia Error:", error.message);
        await sock.sendMessage(msg.key.remoteJid, { text: helpers.t('action_wiki_error_general') });
    }
};