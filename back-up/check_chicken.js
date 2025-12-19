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
        console.log('--- CHECKING USER DATA ---');

        // 1. Check for "Chicken Wrap"
        const [wraps] = await pool.query("SELECT * FROM MENU WHERE MENU_NAME LIKE '%Chicken Wrap%'");
        console.log(`Found Chicken Wraps: ${wraps.length}`);
        wraps.forEach(w => console.log(`ID: ${w.MENU_ID}, Name: ${w.MENU_NAME}, UserID: ${w.USER_ID}`));

        // 2. Check for "Beef Bowl" (Default for verification)
        const [bowls] = await pool.query("SELECT * FROM MENU WHERE MENU_NAME LIKE '%Beef Bowl%'");
        console.log(`Found Beef Bowls: ${bowls.length}`);
        bowls.forEach(b => console.log(`ID: ${b.MENU_ID}, Name: ${b.MENU_NAME}, UserID: ${b.USER_ID}`));

        // 3. Hidden Menu Check
        const [hidden] = await pool.query("SELECT * FROM USER_HIDDEN_MENU");
        console.log(`Hidden Count: ${hidden.length}`);

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
check();
