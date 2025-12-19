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

        console.log("--- Diagnosing History for 'Abalone' ---");

        // 1. Find History records for Abalone
        const sql = `
            SELECT h.HISTORY_ID, h.USER_ID, h.MENU_ID, h.SELECTION_DATE, m.MENU_NAME, m.USER_ID as OWNER_ID, m.IS_DELETED
            FROM HISTORY h
            JOIN MENU m ON h.MENU_ID = m.MENU_ID
            WHERE m.MENU_NAME LIKE '%Abalone%'
            ORDER BY h.SELECTION_DATE DESC
        `;

        const [rows] = await conn.query(sql);
        console.log(`Found ${rows.length} History entries for Abalone`);

        for (const row of rows) {
            console.log(`\nHistory ID: ${row.HISTORY_ID}, Menu ID: ${row.MENU_ID} (${row.MENU_NAME})`);
            console.log(` - Created By: ${row.OWNER_ID || "System"}, Is Deleted: ${row.IS_DELETED}`);

            // Check Categories for THIS Menu ID
            const [cats] = await conn.query("SELECT * FROM MENU_CATEGORY WHERE MENU_ID = ?", [row.MENU_ID]);
            console.log(` - Category Count: ${cats.length}`);
            if (cats.length > 0) console.log("   - Cates:", cats);
            else console.log("   ❌ NO CATEGORIES DETECTED");

            // Check Situations
            const [sits] = await conn.query("SELECT * FROM MENU_SITUATION WHERE MENU_ID = ?", [row.MENU_ID]);
            console.log(` - Situation Count: ${sits.length}`);
        }

        conn.release();
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
        process.exit();
    }
}
run();
