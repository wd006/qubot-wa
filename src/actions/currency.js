// src/actions/currency.js

module.exports.command = {
    name: 'currency',
    aliases: ['kur', 'cevir', 'doviz', 'rate'],
    description: 'action_currency_desc',
    usage: '[amount] [base] [target(s)]'
};

// ai action name
module.exports.actionName = 'get_currency_rate';

module.exports.execute = async function (sock, msg, params, app) {
    // get params from app
    const { axios } = app.lib;
    const { t } = app.utils;
    const log = app.utils.logger;
    const { LANGUAGE } = app.config;

    let amount = 1.0;
    let baseCurrency = 'USD';
    let targetCurrencies = [];

    try {
        if (typeof params === 'string') {
            // !currency 50 EUR TRY -> from user
            let args = params.toUpperCase().split(' ').filter(Boolean);

            // 1st param
            if (args.length > 0 && !isNaN(parseFloat(args[0]))) {
                amount = parseFloat(args.shift());
            }
            // 2nd param -> base
            if (args.length > 0) {
                baseCurrency = args.shift();
            }
            // other params -> (target)
            targetCurrencies = args;

        } else if (typeof params === 'object' && params !== null) {
            // { amount: 50, base: "EUR", targets: ["TRY"] } -> from ai
            amount = parseFloat(params.amount) || 1.0;
            baseCurrency = (params.base || 'TRY').toUpperCase();
            targetCurrencies = params.targets || [];

            // clear empty params
            targetCurrencies = targetCurrencies.map(code => code.toUpperCase()).filter(Boolean);
        }

        // use defaults
        if (targetCurrencies.length === 0) {
            targetCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'TRY'];
        }
    } catch (parseError) {
        log.error("ACTIONS", "currency: Parameter parsing error", parseError);
        await sock.sendMessage(msg.key.remoteJid, { text: t('action_currency_error_usage') });
        return;
    }

    // api request and answering
    try {
        const apiUrl = `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`;
        const response = await axios.get(apiUrl);

        const rates = response.data.rates;
        const date = new Date(response.data.date).toLocaleDateString('en-EN');

        let resultText = `📈 *${t('action_currency_header')} (${date})*\n\n`;
        let foundAny = false;

        const emojiMap = {
            'TRY': '🇹🇷', 'USD': '🇺🇸', 'EUR': '🇪🇺', 'GBP': '🇬🇧',
            'JPY': '🇯🇵', 'CNY': '🇨🇳', 'RUB': '🇷🇺', 'AZN': '🇦🇿',
            'CAD': '🇨🇦', 'AUD': '🇦🇺'
        };

        targetCurrencies.forEach(targetCode => {
            const rate = rates[targetCode];
            if (rate) {
                const convertedValue = (amount * rate).toFixed(5); // 2 decimal places
                const emoji = emojiMap[targetCode] || '💰';

                resultText += `${emoji} *${amount} ${baseCurrency}* = ${convertedValue} ${targetCode}\n`;
                foundAny = true;
            }
        });

        if (!foundAny) {
            if (typeof params === 'string') {
                await sock.sendMessage(msg.key.remoteJid, { text: t('action_currency_error_targetNotFound') });
            }
            return;
        }

        await sock.sendMessage(msg.key.remoteJid, { text: resultText.trim() });

    } catch (error) {
        log.error('ACTIONS', "currency: API Error", error.message);

        let errorMessage = t('action_currency_error_general');
        if (error.response && error.response.status === 404) {
            errorMessage = t('action_currency_error_baseNotFound', { code: baseCurrency });
        }

        // if it's a user message, then it will give an error.
        if (typeof params === 'string') {
            await sock.sendMessage(msg.key.remoteJid, { text: errorMessage });
        }
    }
};