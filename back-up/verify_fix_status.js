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
        console.log('--- VERIFYING FIX STATUS ---');

        // 1. Check Count
        const [rows] = await pool.query("SELECT COUNT(*) as count FROM MENU_CATEGORY");
        console.log("Total Categories:", rows[0].count);

        // 2. Check Specific Item (1001 - Suki Shabu -> Should be 10005 Buffet)
        const [rows2] = await pool.query("SELECT * FROM MENU_CATEGORY WHERE MENU_ID = 1001");
        console.log("ID 1001 Categories:", rows2);

        // 3. Check Shrimp (1047 or 1029 depending on ID) -> Should be Rice (10003?? User said Rice 10003 in SQL)
        // User SQL: INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1047, 10003); -- Shrimp Fried Rice (Rice)
        // Note: Earlier I thought Shrimp was 1029. User SQL says 1047 ?? 
        // Let's check both 1029 and 1047.
        const [rows3] = await pool.query("SELECT * FROM MENU_CATEGORY WHERE MENU_ID IN (1029, 1047, 1042)");
        console.log("Shrimp/Kimchi Check:", rows3);

    } catch (e) { console.error(e); } finally { pool.end(); }
}
run();
