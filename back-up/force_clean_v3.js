const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME
    });
    try {
        console.log('--- FORCE CLEAN V3 ---');

        // 1. DELETE ALL TARTS EXCEPT 1026
        // Using LIKE to catch "Tart " or " Tart"
        console.log("Deleting Duplicate Tarts...");
        await pool.query("DELETE FROM MENU_CATEGORY WHERE MENU_ID IN (SELECT MENU_ID FROM MENU WHERE MENU_NAME LIKE '%Tart%' AND MENU_ID != 1026)");
        await pool.query("DELETE FROM MENU_SITUATION WHERE MENU_ID IN (SELECT MENU_ID FROM MENU WHERE MENU_NAME LIKE '%Tart%' AND MENU_ID != 1026)");
        await pool.query("DELETE FROM MENU WHERE MENU_NAME LIKE '%Tart%' AND MENU_ID != 1026");

        // 2. DELETE ALL "Dessert" CATEGORIES attached to Shrimp/Kimchi (if any remain)
        console.log("Fixing Categories...");
        // Shrimp (1029)
        await pool.query("DELETE FROM MENU_CATEGORY WHERE MENU_ID = 1029");
        await pool.query("INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1029, 10002)"); // Rice
        // Kimchi (1042)
        await pool.query("DELETE FROM MENU_CATEGORY WHERE MENU_ID = 1042");
        await pool.query("INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1042, 10004)"); // Soup

        console.log('Done.');
    } catch (e) { console.error(e); } finally { pool.end(); }
}
run();
