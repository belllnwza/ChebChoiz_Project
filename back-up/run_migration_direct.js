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
        console.log("Connected. Checking columns...");

        // 1. Add IS_DELETED
        try {
            await conn.query("ALTER TABLE MENU ADD COLUMN IS_DELETED TINYINT DEFAULT 0");
            console.log("✅ Added IS_DELETED column.");
        } catch (e) {
            console.log("ℹ️ IS_DELETED result:", e.code || e.message);
        }

        // 2. Fix ID
        try {
            await conn.query("SET FOREIGN_KEY_CHECKS=0");
            await conn.query("ALTER TABLE MENU MODIFY MENU_ID INT");
            await conn.query("ALTER TABLE MENU_CATEGORY MODIFY MENU_ID INT");
            await conn.query("ALTER TABLE MENU_SITUATION MODIFY MENU_ID INT");
            await conn.query("ALTER TABLE HISTORY MODIFY MENU_ID INT");
            await conn.query("ALTER TABLE USER_HIDDEN_MENU MODIFY MENU_ID INT");
            await conn.query("SET FOREIGN_KEY_CHECKS=1");
            console.log("✅ Modified MENU_ID to INT.");
        } catch (e) {
            console.log("❌ Failed to modify ID:", e.message);
        }

        conn.release();
    } catch (e) {
        console.error("Connection failed:", e);
    } finally {
        pool.end();
        process.exit();
    }
}

run();
