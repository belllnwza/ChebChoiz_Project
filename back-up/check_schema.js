const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log("--- MENU TABLE ---");
        const [menuCols] = await pool.query("DESCRIBE MENU");
        console.table(menuCols);

        console.log("\n--- HISTORY TABLE ---");
        const [histCols] = await pool.query("DESCRIBE HISTORY");
        console.table(histCols);

        console.log("\n--- CONSTRAINTS ---");
        const [constraints] = await pool.query(`
            SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('MENU', 'HISTORY');
        `, [process.env.DB_NAME]);
        console.table(constraints);

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

checkSchema();