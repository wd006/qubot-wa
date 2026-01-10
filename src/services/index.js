// src/services/index.js
const aiLoader = require('./ai');

module.exports = (app) => {

    return {
        ai: aiLoader(app)
    };
};