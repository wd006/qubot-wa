const axios = require('axios');

module.exports.command = {
    name: 'currency',
    aliases: ['kur', 'cevir', 'doviz', 'rate'],
    description: 'action_currency_desc',
    usage: '[amount] [based_rate] [target_rate]'
};

// ai action name
module.exports.actionName = 'get_currency_rate';

module.exports.execute = async function (sock, msg, params, helpers) {
    let amount = 1.0;
    let baseCurrency = 'USD';
    let targetCurrencies = [];

    // --- INPUT ANALYSIS ---
    // This block safely sets variables based on the type of input.
    try {
        if (typeof params === 'string') {
            // !currency 50 EUR TRY -> from user
            let args = params.toUpperCase().split(' ').filter(Boolean); // removes empty elements

            // amount control
            if (args.length > 0 && !isNaN(parseFloat(args[0]))) {
                amount = parseFloat(args.shift());
            }
            // based rate control
            if (args.length > 0) {
                baseCurrency = args.shift();
            }
            // target rates control
            targetCurrencies = args;

        } else if (typeof params === 'object' && params !== null) {
            // { amount: 50, base: "EUR", targets: ["TRY"] } -> from ai
            amount = parseFloat(params.amount) || 1.0;
            baseCurrency = (params.base || 'TRY').toUpperCase();
            targetCurrencies = params.targets || [];

            // clear if AI sends an empty array -> ['']
            targetCurrencies = targetCurrencies.map(code => code.toUpperCase()).filter(Boolean);
        }

        // if there is no target exchange rate use the defaults
        if (targetCurrencies.length === 0) {
            targetCurrencies = ['USD', 'EUR', 'GBP', 'JPY'];
        }
    } catch (parseError) {
        console.error("❌ An error occurred while parsing the parameter:", parseError);
        //logger.logAction(this.actionName || this.command.name, 'Parser', params, false, parseError.message);
        await sock.sendMessage(msg.key.remoteJid, { text: helpers.t('action_currency_error_params') });
        return;
    }
    // --- END ANALYSIS ---

    // --- API REQUEST AND ANSWERING ---
    try {
        const apiUrl = `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`;
        const response = await axios.get(apiUrl);

        const rates = response.data.rates;
        const date = new Date(response.data.date).toLocaleDateString('en-EN');

        let resultText = `📈 *${helpers.t('action_currency_header')} (${date})*\n\n`;
        let foundAny = false;

        targetCurrencies.forEach(targetCode => {
            const rate = rates[targetCode];
            if (rate) {
                const convertedValue = (amount * rate).toFixed(4);
                const emoji = { 
                    TRY: '🇹🇷', 
                    USD: '🇺🇸', 
                    EUR: '🇪🇺', 
                    GBP: '🇬🇧', 
                    JPY: '🇯🇵' }
                    [targetCode] || '💰';
                resultText += `${emoji} *${amount} ${baseCurrency}* = ${convertedValue} ${targetCode}\n`;
                foundAny = true;
            }
        });

        // if none of the requested exchange rates are available
        if (!foundAny) {
            console.log("could not be found");
            //logger.logAction(this.actionName || this.command.name, 'API', { baseCurrency, targetCurrencies }, false, 'The specified target exchange rates could not be found.');
            if (typeof params === 'string') {
                await sock.sendMessage(msg.key.remoteJid, { text: helpers.t('action_currency_error_targetNotFound') });
            }
            return;
        }

        // success
        console.log("currency success");
        //logger.logAction(this.actionName || this.command.name, typeof params === 'string' ? 'Command' : 'AI', params, true);

        await sock.sendMessage(msg.key.remoteJid, { text: resultText.trim() });

    } catch (error) {
        let errorMessage = helpers.t('action_currency_error_general');
        if (error.response && error.response.status === 404) {
            errorMessage = helpers.t('action_currency_error_baseNotFound', {'code': baseCurrency});
        }

        // error
        console.log("currency error");
        //logger.logAction(this.actionName || this.command.name, typeof params === 'string' ? 'Command' : 'AI', params, false, error.message);

        // not ai error
        if (typeof params === 'string') {
            await sock.sendMessage(msg.key.remoteJid, { text: errorMessage });
        }
    }
};