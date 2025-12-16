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

        const [rows] = await connection.execute("DESCRIBE HISTORY");
        console.log(JSON.stringify(rows, null, 2));
        await connection.end();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();