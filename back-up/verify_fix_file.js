const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function verify() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // Check Shabu (1001)
        const [rows] = await pool.query(`
            SELECT m.MENU_NAME, c.CATE_NAME 
            FROM MENU m
            JOIN MENU_CATEGORY mc ON m.MENU_ID = mc.MENU_ID
            JOIN CATEGORY c ON mc.CATE_ID = c.CATE_ID
            WHERE m.MENU_ID = 1001
        `);

        let result = "FAIL";
        if (rows.length > 0) {
            const row = rows[0];
            if (row.CATE_NAME === 'Buffet') {
                result = "SUCCESS: Shabu is Buffet";
            } else {
                result = `FAIL: Shabu is ${row.CATE_NAME}`;
            }
        } else {
            result = "FAIL: Shabu not found or has no category";
        }

        fs.writeFileSync('verification_result.txt', result);
        console.log(result);

    } catch (e) {
        fs.writeFileSync('verification_result.txt', 'ERROR: ' + e.message);
        console.error(e);
    } finally {
        pool.end();
    }
}
verify();
