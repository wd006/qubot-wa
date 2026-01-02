require('dotenv').config();
const fs = require('fs');
const path = require('path');

/**
 * It reads the specified prompt file, cleans up HTML comments, and returns the content.
 * @param {string} fileName - The name of the file in the prompts folder (e.g., 'core.prompt')
 * @returns {string} File contents or error message.
 */
function loadPrompt(fileName) {
    try {
        const filePath = path.join(__dirname, `../prompts/${fileName}`);
        
        const rawContent = fs.readFileSync(filePath, 'utf8');
        
        // <!-- cleaner --> regex
        const cleanContent = rawContent.replace(/<!--[\s\S]*?-->/g, '').trim();
        
        console.log(`✅ Prompt loaded: ${fileName}`);
        
        return cleanContent;

    } catch (error) {
        console.error(`❌ ERROR: ${fileName} file could not be read! Please check if the file exists.`, error.message);
        return null;
    }
}

const actionsPrompt = loadPrompt('actions.prompt');
const corePrompt = loadPrompt('core.prompt');
const personaPrompt = loadPrompt('persona.prompt');

module.exports = {

    LANGUAGE: 'en',

    GEMINI_KEY: process.env.GEMINI_KEY,
    GEMINI_MODEL: "gemini-flash-latest",
    ALLOWED_NUMBERS: process.env.OWNER_NUMBER ? [process.env.OWNER_NUMBER] : [],

    // typing effect
    composing: {
        animation: true,
        charPerSec: 10,
        minDelay: 2000,
        maxDelay: 10000,
    },

    prefix: '!', // prefix for commands

    SYSTEM_PROMPT: `${corePrompt}\n\n${actionsPrompt}\n\n${personaPrompt}`,
};