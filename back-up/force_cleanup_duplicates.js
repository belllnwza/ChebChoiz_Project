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
        console.log('--- FORCING GLOBAL CLEANUP ---');

        // 1. Delete Child Records for User Menus (> 20000)
        // Note: System menus are IDs < 10000. 
        // My restore script used 1001-1081. 
        // User edits usually get new ID or high ID. 
        // Safest bet: Delete anything where USER_ID IS NOT NULL.

        console.log("Deleting User Categories...");
        await pool.query('DELETE FROM MENU_CATEGORY WHERE MENU_ID IN (SELECT MENU_ID FROM MENU WHERE USER_ID IS NOT NULL)');

        console.log("Deleting User Situations...");
        try {
            await pool.query('DELETE FROM MENU_SITUATION WHERE MENU_ID IN (SELECT MENU_ID FROM MENU WHERE USER_ID IS NOT NULL)');
        } catch (e) { }

        console.log("Deleting User Menus...");
        await pool.query('DELETE FROM MENU WHERE USER_ID IS NOT NULL');

        console.log("Clearing Hidden Menus...");
        await pool.query('DELETE FROM USER_HIDDEN_MENU');

        console.log('✅ CLEANUP COMPLETE. Only System Menus remain.');

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
