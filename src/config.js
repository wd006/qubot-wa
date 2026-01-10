require('dotenv').config();

const config = {

    LANGUAGE: 'en',
    LOCALE: 'en-US',

    PREFIX: '!',
    OWNER_NUMBER: process.env.OWNER_NUMBER,

    DEBUG: false,

    AI: {
        LLM: {
            activeProvider: 'gemini', // ['gemini', 'mistral']
            
            mistral: {
                apiKey: process.env.MISTRAL_KEY,
                model: "open-mixtral-8x7b" // ['open-mistral-7b', 'open-mixtral-8x7b']
            },
            gemini: {
                apiKey: process.env.GEMINI_KEY,
                model: "gemini-2.0-flash" // ['gemini-2.0-flash', 'gemini-flash-latest', ...]
            }
        },

        MEDIA: {
            activeProvider: 'pollinations', // ['hf', 'pollinations']

            hf: {
                apiKey: process.env.HF_KEY,
                model: "black-forest-labs/FLUX.1-dev"
            },
            pollinations: {
                apiKey: process.env.POLLINATIONS_KEY,
                model: "flux"
            }
        }
    },

    // typing effect
    COMPOSING: {
        enabled: true,
        charPerSec: 10,
        minDelay: 2000,
        maxDelay: 10000,
    },

    SYSTEM_PROMPT: "" // must be blank
};

module.exports = config;