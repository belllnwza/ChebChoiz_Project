const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('--- SURGICAL CLEANUP ---');

        // 1. Fix TART (Kill all Tarts that are NOT the original 1026)
        // Adjust ID 1026 if your hardcoded list says otherwise, but usually 1026 is Tart.
        console.log("Fixing Tart...");
        await pool.query("DELETE FROM MENU_CATEGORY WHERE MENU_ID IN (SELECT MENU_ID FROM MENU WHERE MENU_NAME='Tart' AND MENU_ID != 1026)");
        await pool.query("DELETE FROM MENU_SITUATION WHERE MENU_ID IN (SELECT MENU_ID FROM MENU WHERE MENU_NAME='Tart' AND MENU_ID != 1026)");
        await pool.query("DELETE FROM MENU WHERE MENU_NAME='Tart' AND MENU_ID != 1026");

        // 2. Fix Categories (Force update for 1029, 1042)
        console.log("Forcing Categories...");

        // Shrimp Fried Rice (1029) -> Rice (10002)
        await pool.query("DELETE FROM MENU_CATEGORY WHERE MENU_ID = 1029");
        await pool.query("INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1029, 10002)");

        // Kimchi Soup (1042) -> Soup (10004)
        await pool.query("DELETE FROM MENU_CATEGORY WHERE MENU_ID = 1042");
        await pool.query("INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1042, 10004)");

        // 3. Clear ALL User Menus to be safe (Reset)
        console.log("Blanket User Cleanup...");
        await pool.query('DELETE FROM MENU WHERE USER_ID IS NOT NULL');

        console.log('Done.');

    } catch (e) { console.error(e); } finally { pool.end(); }
}
run();
