const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME
    });
    try {
        const [cats] = await pool.query('SELECT * FROM CATEGORY');
        console.log('CATEGORIES:', JSON.stringify(cats));
        const [sits] = await pool.query('SELECT * FROM SITUATION');
        console.log('SITUATIONS:', JSON.stringify(sits));
    } catch (e) { console.error(e); } finally { pool.end(); }
}
run();
