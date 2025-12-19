const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkImages() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // Check a few default items
        const [rows] = await pool.query('SELECT MENU_ID, MENU_NAME, IMAGE_URL FROM MENU WHERE MENU_ID IN (1001, 1002, 1003, 1050)');
        console.log('Sample Default Items:');
        console.table(rows);

        const [nullCount] = await pool.query('SELECT COUNT(*) as count FROM MENU WHERE IMAGE_URL IS NULL AND MENU_ID < 20000');
        console.log('Number of default items with NULL image:', nullCount[0].count);

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

checkImages();
