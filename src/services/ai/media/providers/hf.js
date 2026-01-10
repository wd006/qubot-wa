// src/services/ai/media/providers/hf.js
module.exports = async function generate(prompt, config, tools) {
    const { axios } = tools;

    if (!config.apiKey) {
        throw new Error("Hugging Face API Key is missing in config.");
    }

    const apiUrl = `https://api-inference.huggingface.co/models/${config.model}`;
    
    const response = await axios.post(apiUrl, 
        { inputs: prompt }, 
        {
            headers: { 
                Authorization: `Bearer ${config.apiKey}`,
                "Content-Type": "application/json"
            },
            responseType: 'arraybuffer'
        }
    );

    return {
        buffer: response.data,
        provider: "Hugging Face",
        model: config.model
    };
};