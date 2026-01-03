// src/actions/wiki.js

module.exports.command = {
    name: 'wiki',
    aliases: ['wikipedia', 'bilgi', 'info', 'nedir'],
    description: 'action_wiki_desc'
};

module.exports.actionName = 'wikipedia_search';

module.exports.execute = async function(sock, msg, params, app) {
    const { axios } = app.lib;
    const { t } = app.utils;
    const { LANGUAGE } = app.config;

    const query = typeof params === 'string' ? params : params.query;

    if (!query) {
        await sock.sendMessage(msg.key.remoteJid, { text: t('action_wiki_error_usage') });
        return;
    }

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
    };

    try {
        // search and find full title
        const searchUrl = `https://${LANGUAGE}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&namespace=0&format=json`;
        const searchResponse = await axios.get(searchUrl, { headers });
        
        // Opensearch answer: [query, [Title], [Desc], [Link]]
        const pageTitle = searchResponse.data[1][0];
        const pageLink = searchResponse.data[3][0];
        
        if (!pageTitle) {
            await sock.sendMessage(msg.key.remoteJid, { text: t('action_wiki_error_notFound', {'query': query}) });
            return;
        }

        // fetch summary text
        const summaryUrl = `https://${LANGUAGE}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&redirects=1&format=json&titles=${encodeURIComponent(pageTitle)}`;
        const summaryResponse = await axios.get(summaryUrl, { headers });
        
        const pages = summaryResponse.data.query.pages;
        const pageId = Object.keys(pages)[0];
        const extract = pages[pageId].extract;

        if (!extract) {
            await sock.sendMessage(msg.key.remoteJid, { text: t('action_wiki_error_summary') });
            return;
        }
        
        // output
        const resultText = `
📖 *${t('action_wiki_header', { title: pageTitle })}*

${extract.substring(0, 500)}${extract.length > 500 ? '...' : ''}

*${t('action_wiki_goLink')}:*
_🔗 ${pageLink || ''}_`;

        await sock.sendMessage(msg.key.remoteJid, { text: resultText.trim() });

    } catch (error) {
        console.error("❌ Wikipedia Error:", error.message);
        await sock.sendMessage(msg.key.remoteJid, { text: t('action_wiki_error_general') });
    }
};