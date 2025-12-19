const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        const conn = await pool.getConnection();
        console.log("--- 🚑 Auto-Repair Orphaned History Menus ---");

        // 1. Find Menus in History that have NO Categories
        // We look at all menus referenced in history, check if they have 0 categories
        const [orphans] = await conn.query(`
            SELECT DISTINCT h.MENU_ID, m.MENU_NAME 
            FROM HISTORY h
            JOIN MENU m ON h.MENU_ID = m.MENU_ID
            WHERE NOT EXISTS (
                SELECT 1 FROM MENU_CATEGORY mc WHERE mc.MENU_ID = h.MENU_ID
            )
        `);

        console.log(`Found ${orphans.length} orphaned menus in history.`);

        for (const orphan of orphans) {
            console.log(`\n🔧 Repairing: ${orphan.MENU_NAME} (ID: ${orphan.MENU_ID})`);

            // 2. Find a "Donor" (A menu with the same name that HAS categories)
            // Prefer System menus (ID < 20000) or any healthy custom menu
            const [donors] = await conn.query(`
                SELECT m.MENU_ID 
                FROM MENU m
                JOIN MENU_CATEGORY mc ON m.MENU_ID = mc.MENU_ID
                WHERE m.MENU_NAME = ? 
                AND m.MENU_ID != ?
                ORDER BY m.MENU_ID ASC 
                LIMIT 1
            `, [orphan.MENU_NAME, orphan.MENU_ID]);

            if (donors.length > 0) {
                const donorId = donors[0].MENU_ID;
                console.log(`   ✅ Found Donor ID: ${donorId}`);

                // 3. Copy Categories
                const [cats] = await conn.query("SELECT CATE_ID FROM MENU_CATEGORY WHERE MENU_ID = ?", [donorId]);
                for (const c of cats) {
                    await conn.query("INSERT IGNORE INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (?, ?)", [orphan.MENU_ID, c.CATE_ID]);
                }
                console.log(`      -> Copied ${cats.length} categories.`);

                // 4. Copy Situations
                const [sits] = await conn.query("SELECT SIT_ID FROM MENU_SITUATION WHERE MENU_ID = ?", [donorId]);
                for (const s of sits) {
                    await conn.query("INSERT IGNORE INTO MENU_SITUATION (MENU_ID, SIT_ID) VALUES (?, ?)", [orphan.MENU_ID, s.SIT_ID]);
                }
                console.log(`      -> Copied ${sits.length} situations.`);

            } else {
                console.log(`   ❌ No donor found. Using Default (Soup/Lunch) fallback.`);
                // Fallback for completely unknown menus (like Abalone if no system menu exists)
                if (orphan.MENU_NAME.toLowerCase().includes('abalone')) {
                    await conn.query("INSERT IGNORE INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (?, 4)", [orphan.MENU_ID]); // Soup
                    await conn.query("INSERT IGNORE INTO MENU_SITUATION (MENU_ID, SIT_ID) VALUES (?, 2)", [orphan.MENU_ID]); // Lunch
                    console.log("      -> Applied 'Abalone' default fallback.");
                }
            }
        }

        console.log("\n✅ Repair Complete.");
        conn.release();
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
        process.exit();
    }
}
run();
