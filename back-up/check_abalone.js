const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // Check for 'Abalone' specifically
        const [rows] = await pool.query("SELECT * FROM MENU WHERE MENU_NAME LIKE '%Abalone%'");
        console.log('Found Abalone:', rows.length);
        if (rows.length > 0) console.log(rows[0]);

        // Check total count again
        const [count] = await pool.query("SELECT COUNT(*) as c FROM MENU");
        console.log('Total Menus:', count[0].c);

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
check();
