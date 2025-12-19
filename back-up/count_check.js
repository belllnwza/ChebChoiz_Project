const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function check() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM MENU');
        const count = rows[0].count;
        console.log(`COUNT: ${count}`);
        fs.writeFileSync(path.join(__dirname, 'count.txt'), `TOTAL_MENUS: ${count}`);
    } catch (e) {
        console.error(e);
        fs.writeFileSync(path.join(__dirname, 'count.txt'), `ERROR: ${e.message}`);
    } finally {
        pool.end();
    }
}
check();
