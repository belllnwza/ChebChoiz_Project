const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const [rows] = await pool.query('SELECT COUNT(*) as count FROM MENU');
        console.log("Menu Count:", rows[0].count);

        const [sample] = await pool.query('SELECT * FROM MENU LIMIT 5');
        console.log("Sample:", sample);

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
