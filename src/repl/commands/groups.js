module.exports = {
    name: 'groups',
    description: 'repl_groups_desc',
    
    execute: async function(sock, args) {
        try {
            // group function from baileys
            const groups = await sock.groupFetchAllParticipating();
            
            if (Object.keys(groups).length === 0) {
                console.log("ℹ️ The bot is not currently in any group.");
                return;
            }

            console.log("\n--- 🏢 Groups ---");
            
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