const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugReset() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('--- DEBUGGING RESET ---');

        // 1. Check System Menus (Should exist and have images)
        const [systemMenus] = await pool.query('SELECT COUNT(*) as count, COUNT(IMAGE_URL) as img_count FROM MENU WHERE USER_ID IS NULL');
        console.log(`System Menus: ${systemMenus[0].count} total, ${systemMenus[0].img_count} with images.`);

        if (systemMenus[0].count === 0) {
            console.error('CRITICAL: No system menus found!');
        }

        // 2. Check a sample user (e.g., ID 10001 or find one)
        const [users] = await pool.query('SELECT USER_ID, USER_NAME FROM USER LIMIT 1');
        if (users.length === 0) {
            console.log('No users found to test reset on.');
            return;
        }
        const userId = users[0].USER_ID;
        console.log(`Testing with User ID: ${userId} (${users[0].USER_NAME})`);

        // 3. Check Current State for User
        const [customMenus] = await pool.query('SELECT COUNT(*) as cnt FROM MENU WHERE USER_ID = ?', [userId]);
        const [hiddenMenus] = await pool.query('SELECT COUNT(*) as cnt FROM USER_HIDDEN_MENU WHERE USER_ID = ?', [userId]);
        console.log(`Before Reset: ${customMenus[0].cnt} custom menus, ${hiddenMenus[0].cnt} hidden system menus.`);

        // 4. Simulate Reset Logic
        console.log('Simulating Reset...');
        await pool.execute('DELETE FROM MENU WHERE USER_ID = ?', [userId]);
        await pool.execute('DELETE FROM USER_HIDDEN_MENU WHERE USER_ID = ?', [userId]);

        // 5. Check After State
        const [customAfter] = await pool.query('SELECT COUNT(*) as cnt FROM MENU WHERE USER_ID = ?', [userId]);
        const [hiddenAfter] = await pool.query('SELECT COUNT(*) as cnt FROM USER_HIDDEN_MENU WHERE USER_ID = ?', [userId]);
        console.log(`After Reset: ${customAfter[0].cnt} custom menus, ${hiddenAfter[0].cnt} hidden system menus.`);

        if (customAfter[0].cnt === 0 && hiddenAfter[0].cnt === 0) {
            console.log('SUCCESS: Reset logic executed correctly on DB side.');
        } else {
            console.error('FAILURE: Reset logic did not clear data.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

debugReset();
