// İleride buraya: const reminderAction = require('./reminder'); şeklinde eklemeler yapacağız.

const actions = {
    // 'set_reminder': reminderAction, 
};

/**
 * Gelen aksiyonu ilgili dosyaya yönlendirir.
 * @param {object} sock - Baileys soket bağlantısı
 * @param {object} msg - Gelen mesaj objesi
 * @param {object} actionData - AI'dan gelen action verisi { type, params }
 */
async function handleAction(sock, msg, actionData) {
    if (!actionData || !actionData.type) return;

    console.log(`⚙️ Aksiyon Tetiklendi: ${actionData.type}`);

    const handler = actions[actionData.type];

    if (handler) {
        try {
            await handler(sock, msg, actionData.params);
        } catch (error) {
            console.error(`❌ Aksiyon Hatası (${actionData.type}):`, error);
        }
    } else {
        console.warn(`⚠️ Tanımsız Aksiyon: ${actionData.type}`);
    }
}

module.exports = { handleAction };