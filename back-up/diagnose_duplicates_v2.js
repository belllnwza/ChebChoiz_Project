const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME
    });
    try {
        console.log('--- DIAGNOSTIC DUMP ---');
        const names = ['Tart', 'Kimchi Soup', 'Shrimp Fried Rice'];

        // Check IDs and Owners
        const sql = `
            SELECT m.MENU_ID, m.MENU_NAME, m.USER_ID, c.CATE_NAME, s.SIT_NAME
            FROM MENU m
            LEFT JOIN MENU_CATEGORY mc ON m.MENU_ID = mc.MENU_ID
            LEFT JOIN CATEGORY c ON mc.CATE_ID = c.CATE_ID
            LEFT JOIN MENU_SITUATION ms ON m.MENU_ID = ms.MENU_ID
            LEFT JOIN SITUATION s ON ms.SIT_ID = s.SIT_ID
            WHERE m.MENU_NAME IN (?, ?, ?)
            ORDER BY m.MENU_NAME, m.MENU_ID
        `;

        const [rows] = await pool.query(sql, names);
        console.table(rows);

    } catch (e) { console.error(e); } finally { pool.end(); }
}
run();
