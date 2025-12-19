const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSystemMenus() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM MENU WHERE USER_ID IS NULL');
        console.log(`System Menus Count: ${rows[0].count}`);

        if (rows[0].count === 0) {
            console.log("WARNING: NO SYSTEM MENUS FOUND. Reset will result in empty list.");
        } else {
            console.log("System menus exist.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

checkSystemMenus();
