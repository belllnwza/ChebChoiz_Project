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
        console.log("--- Aggressive Fix for 'Abalone' ---");

        // 1. Get ALL Abalone Menus (Even deleted ones if valid in history)
        // Just search by Name
        const [rows] = await conn.query("SELECT MENU_ID FROM MENU WHERE MENU_NAME LIKE '%Abalone%'");

        if (rows.length > 0) {
            console.log(`Found ${rows.length} 'Abalone' rows.`);

            for (const row of rows) {
                const menuId = row.MENU_ID;

                // Check Category Count
                const [cats] = await conn.query("SELECT CATE_ID FROM MENU_CATEGORY WHERE MENU_ID = ?", [menuId]);

                if (cats.length === 0) {
                    console.log(`[FIX] Menu ${menuId} has NO categories. Inserting Soup (4)...`);
                    await conn.query("INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (?, 4)", [menuId]);
                } else {
                    console.log(`[SKIP] Menu ${menuId} already has categories: ${cats.length}`);
                }

                // Check Situation Count
                const [sits] = await conn.query("SELECT SIT_ID FROM MENU_SITUATION WHERE MENU_ID = ?", [menuId]);
                if (sits.length === 0) {
                    console.log(`[FIX] Menu ${menuId} has NO situations. Inserting Lunch (2)...`);
                    await conn.query("INSERT INTO MENU_SITUATION (MENU_ID, SIT_ID) VALUES (?, 2)", [menuId]);
                }
            }
            console.log("✅ All Abalone menus checked and patched.");
        } else {
            console.log("No Abalone menus found in DB.");
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
