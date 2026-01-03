require('dotenv').config();

const config = {

    LANGUAGE: 'en',
    LOCALE: 'en-US',

    PREFIX: '!',
    OWNER_NUMBER: process.env.OWNER_NUMBER,


    AI: {
        activeProvider: 'gemini', // ['gemini', 'mistral']

        mistral: {
            apiKey: process.env.MISTRAL_KEY,
            model: "open-mixtral-8x7b" // ['open-mistral-7b', 'open-mixtral-8x7b']
        },
        gemini: {
            apiKey: process.env.GEMINI_KEY,
            model: "gemini-2.0-flash" // ['gemini-flash-latest', 'gemini-2.0-flash']
        },
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