const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    console.log("--- 🧹 Cleanup Anomaly IDs (10811, 20001) ---");
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    const conn = await pool.getConnection();

    try {
        const targetIds = [10811, 20001];

        for (const id of targetIds) {
            console.log(`\nDeleting ID ${id}...`);

            // Delete dependencies first
            await conn.query("DELETE FROM HISTORY WHERE MENU_ID = ?", [id]);
            await conn.query("DELETE FROM MENU_CATEGORY WHERE MENU_ID = ?", [id]);
            await conn.query("DELETE FROM MENU_SITUATION WHERE MENU_ID = ?", [id]);
            await conn.query("DELETE FROM USER_HIDDEN_MENU WHERE MENU_ID = ?", [id]);

            // Delete menu itself
            const [res] = await conn.query("DELETE FROM MENU WHERE MENU_ID = ?", [id]);
            console.log(`✅ Deleted MENU ID ${id}: ${res.affectedRows} rows`);
        }

        console.log("\n✅ Cleanup Complete!");

    } catch (e) {
        console.error("❌ Cleanup Error:", e);
    } finally {
        conn.release();
        pool.end();
        process.exit();
    }
}

run();
