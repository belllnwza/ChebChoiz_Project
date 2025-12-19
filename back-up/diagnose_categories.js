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
        console.log("Checking All System Menus (1001-1081)...");

        const [rows] = await pool.query(`
            SELECT m.MENU_ID, m.MENU_NAME, c.CATE_ID, c.CATE_NAME 
            FROM MENU m
            LEFT JOIN MENU_CATEGORY mc ON m.MENU_ID = mc.MENU_ID
            LEFT JOIN CATEGORY c ON mc.CATE_ID = c.CATE_ID
            WHERE m.MENU_ID BETWEEN 1001 AND 1081
            ORDER BY m.MENU_ID
        `);

        // Format for readability
        let outputText = "--- Current Database State (ID 1001-1081) ---\n";
        rows.forEach(r => {
            const cate = r.CATE_NAME || 'NULL (No Category)';
            outputText += `#${r.MENU_ID} ${r.MENU_NAME} -> ${cate}\n`;
        });

        fs.writeFileSync('diagnose_output.txt', outputText);
        console.log("Full output written to diagnose_output.txt");

    } catch (e) {
        fs.writeFileSync('diagnose_output.txt', 'ERROR: ' + e.message);
        console.error(e);
    } finally {
        pool.end();
    }
}

run();
