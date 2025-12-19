const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        const conn = await pool.getConnection();

        // Find 'Abalone' menus
        const [rows] = await conn.query("SELECT * FROM MENU WHERE MENU_NAME LIKE '%Abalone%'");
        console.log("Found Menus:", rows);

        for (const row of rows) {
            const [cats] = await conn.query("SELECT * FROM MENU_CATEGORY WHERE MENU_ID = ?", [row.MENU_ID]);
            const [sits] = await conn.query("SELECT * FROM MENU_SITUATION WHERE MENU_ID = ?", [row.MENU_ID]);
            console.log(`Menu ID ${row.MENU_ID} (${row.MENU_NAME}): Categories=${cats.length}, Situations=${sits.length}`);
            if (cats.length > 0) console.log(" - Cats:", cats);
        }

        conn.release();
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
        process.exit();
    }
}
run();
