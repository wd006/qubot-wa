module.exports = {
    name: 'groups',
    description: 'Lists all the groups the bot belongs to.',
    
    execute: async function(sock, args) {
        try {
            // group function from baileys
            const groups = await sock.groupFetchAllParticipating();
            
            if (Object.keys(groups).length === 0) {
                console.log("ℹ️ Bot şu an hiçbir grupta değil.");
                return;
            }

            console.log("\n--- 🏢 Botun Dahil Olduğu Gruplar ---");
            
            // Groups are objects; their keys are the group ID, and their values ​​are the group information.
            for (const id in groups) {
                const group = groups[id];
                console.log(`\n> ${group.subject}`); // name
                console.log(`  ID: ${group.id}`);    // id
            }
            console.log("\n------------------------------------");

        } catch (e) {
            console.error("❌ An error occurred while listing the groups:", e);
        }
    }
};