const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    console.log("--- 🔧 Force Schema Update: MENU_ID to INT ---");
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    const conn = await pool.getConnection();
    try {
        console.log("1. Disabling Foreign Keys...");
        await conn.query("SET FOREIGN_KEY_CHECKS=0");

        const tables = ['MENU', 'MENU_CATEGORY', 'MENU_SITUATION', 'HISTORY', 'USER_HIDDEN_MENU'];

        for (const t of tables) {
            console.log(`2. Updating table: ${t}...`);
            try {
                // Check if table exists first
                await conn.query(`SELECT 1 FROM ${t} LIMIT 1`);

                // Alter
                await conn.query(`ALTER TABLE ${t} MODIFY MENU_ID INT`);
                console.log(`   ✅ ${t} updated to INT.`);
            } catch (e) {
                console.log(`   ⚠️ Error updating ${t}: ${e.message}`);
            }
        }

        console.log("3. Re-enabling Foreign Keys...");
        await conn.query("SET FOREIGN_KEY_CHECKS=1");
        console.log("✅ Schema Update Verified.");

    } catch (e) {
        console.error("❌ Fatal Error:", e);
    } finally {
        conn.release();
        pool.end();
        process.exit();
    }
}

run();
