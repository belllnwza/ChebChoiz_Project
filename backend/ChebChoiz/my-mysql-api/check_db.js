require('dotenv').config();
const mysql = require('mysql2/promise');

async function check() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const [rows] = await connection.execute("SELECT MENU_ID, MENU_NAME, IMAGE_URL FROM MENU WHERE MENU_NAME LIKE '%Mushroom%' OR MENU_NAME LIKE '%Grill%'");
        console.log("--- RESULTS START ---");
        console.log(JSON.stringify(rows, null, 2));
        console.log("--- RESULTS END ---");
        await connection.end();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
