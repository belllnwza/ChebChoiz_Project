const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log("Checking Shabu (1001)...");
        const [rows] = await pool.query(`
            SELECT m.MENU_ID, m.MENU_NAME, c.CATE_ID, c.CATE_NAME 
            FROM MENU m
            LEFT JOIN MENU_CATEGORY mc ON m.MENU_ID = mc.MENU_ID
            LEFT JOIN CATEGORY c ON mc.CATE_ID = c.CATE_ID
            WHERE m.MENU_ID = 1001
        `);

        const output = JSON.stringify(rows, null, 2);
        fs.writeFileSync('diagnose_output.txt', output);
        console.log("Output written to diagnose_output.txt");

    } catch (e) {
        fs.writeFileSync('diagnose_output.txt', 'ERROR: ' + e.message);
    } finally {
        pool.end();
    }
}

run();
