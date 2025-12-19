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

        // 1. Get Abalone Menu Ids
        const [rows] = await conn.query("SELECT MENU_ID FROM MENU WHERE MENU_NAME LIKE '%Abalone%'");

        if (rows.length > 0) {
            console.log(`Found ${rows.length} 'Abalone' menus.`);
            for (const row of rows) {
                const menuId = row.MENU_ID;

                // Delete existing (just in case)
                await conn.query("DELETE FROM MENU_CATEGORY WHERE MENU_ID = ?", [menuId]);

                // Insert 'Soup' (ID 4) - Guessing category based on typical 'Abalone Soup'
                await conn.query("INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (?, 4)", [menuId]); // 4 = Soup (Usually)

                // Also add a Situation 'Breakfast' (ID 1) as default if missing? Or just Lunch (2)
                await conn.query("INSERT IGNORE INTO MENU_SITUATION (MENU_ID, SIT_ID) VALUES (?, 2)", [menuId]); // 2 = Lunch

                console.log(`✅ Fixed Data for Menu ID ${menuId}`);
            }
        } else {
            console.log("No Abalone menus found.");
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
