const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('Fixing Categories...');

        // 1. Shrimp Fried Rice (1029) -> Rice
        // 2. Kimchi Soup (1042) -> Soup (and maybe Korean if exists, or just Soup)

        const updates = [
            { id: 1029, cats: ['Rice'], sits: ['Lunch', 'Dinner', 'One-dish'] },
            { id: 1042, cats: ['Soup'], sits: ['Lunch', 'Dinner'] }
        ];

        for (const item of updates) {
            console.log(`Updating ${item.id}...`);
            // Clear old
            await pool.query('DELETE FROM MENU_CATEGORY WHERE MENU_ID = ?', [item.id]);
            await pool.query('DELETE FROM MENU_SITUATION WHERE MENU_ID = ?', [item.id]);

            // Insert New Categories
            for (const catName of item.cats) {
                // Find ID
                const [rows] = await pool.query('SELECT CATE_ID FROM CATEGORY WHERE CATE_NAME = ?', [catName]);
                if (rows.length > 0) {
                    await pool.query('INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (?, ?)', [item.id, rows[0].CATE_ID]);
                    console.log(`  Added Category: ${catName}`);
                } else {
                    console.log(`  Warning: Category ${catName} not found!`);
                }
            }

            // Insert New Situations
            for (const sitName of item.sits) {
                const [rows] = await pool.query('SELECT SIT_ID FROM SITUATION WHERE SIT_NAME = ?', [sitName]);
                if (rows.length > 0) {
                    await pool.query('INSERT INTO MENU_SITUATION (MENU_ID, SIT_ID) VALUES (?, ?)', [item.id, rows[0].SIT_ID]);
                    console.log(`  Added Situation: ${sitName}`);
                }
            }
        }
        console.log('Done.');

    } catch (e) { console.error(e); } finally { pool.end(); }
}
run();
