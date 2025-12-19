const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    console.log("--- 🧹 Cleanup Abalone (ID 20000) ---");
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    const conn = await pool.getConnection(); // Get connection first

    try {
        const targetId = 20000;
        console.log(`Target ID: ${targetId}`);

        // 1. Delete Dependencies first (Foreign Keys)

        // History
        const [res1] = await conn.query("DELETE FROM HISTORY WHERE MENU_ID = ?", [targetId]);
        console.log(`- Deleted from HISTORY: ${res1.affectedRows} rows`);

        // Menu Categories
        const [res2] = await conn.query("DELETE FROM MENU_CATEGORY WHERE MENU_ID = ?", [targetId]);
        console.log(`- Deleted from MENU_CATEGORY: ${res2.affectedRows} rows`);

        // Menu Situations
        const [res3] = await conn.query("DELETE FROM MENU_SITUATION WHERE MENU_ID = ?", [targetId]);
        console.log(`- Deleted from MENU_SITUATION: ${res3.affectedRows} rows`);

        // Hidden Menu mapping
        const [res4] = await conn.query("DELETE FROM USER_HIDDEN_MENU WHERE MENU_ID = ?", [targetId]);
        console.log(`- Deleted from USER_HIDDEN_MENU: ${res4.affectedRows} rows`);

        // 2. Finally, Delete the Menu itself
        const [res5] = await conn.query("DELETE FROM MENU WHERE MENU_ID = ?", [targetId]);
        console.log(`- Deleted from MENU: ${res5.affectedRows} rows`);

        console.log("✅ Cleanup Complete.");

    } catch (e) {
        console.error("❌ Cleanup Error:", e);
    } finally {
        if (conn) conn.release();
        pool.end();
        process.exit();
    }
}

run();
