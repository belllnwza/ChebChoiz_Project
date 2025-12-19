const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME
    });
    try {
        console.log('--- CHECKING TART AND OTHERS ---');
        // Check Tart, Kimchi, Shrimp
        const sql = `
            SELECT MENU_ID, MENU_NAME, IMAGE_URL, USER_ID 
            FROM MENU 
            WHERE MENU_NAME LIKE '%Tart%' 
               OR MENU_NAME LIKE '%Kimchi%' 
               OR MENU_NAME LIKE '%Shrimp%'
        `;
        const [rows] = await pool.query(sql);
        console.table(rows);
    } catch (e) { console.error(e); } finally { pool.end(); }
}
run();
