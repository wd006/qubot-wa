// src/services/ai/media/providers/pollinations.js
module.exports = async function generate(prompt, config, tools) {
    const { axios } = tools;

    const seed = Math.floor(Math.random() * 1000000);
    const model = config.model || 'flux'; 
    
    let url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&model=${model}&nologo=true`;

    if (config.apiKey) {
        url += `&api_key=${config.apiKey}`;
    }

    const response = await axios.get(url, { responseType: 'arraybuffer' });

    return {
        buffer: response.data,
        provider: "Pollinations",
        model: model
    };
};