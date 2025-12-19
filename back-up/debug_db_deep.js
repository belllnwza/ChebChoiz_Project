const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function debugDeep() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const output = [];
    const log = (msg) => {
        console.log(msg);
        output.push(msg);
    };

    try {
        log('--- DEEP DATABASE AUDIT ---');

        // 1. Check System Menus (Master Data)
        // These should have USER_ID = NULL
        const [systemMenus] = await pool.query('SELECT COUNT(*) as count FROM MENU WHERE USER_ID IS NULL');
        log(`System Menus (Master Data): ${systemMenus[0].count}`);

        if (systemMenus[0].count === 0) {
            log('CRITICAL ERROR: No master data found! System menus have been deleted.');
        } else {
            // Check IDs
            const [ids] = await pool.query('SELECT MIN(MENU_ID) as minId, MAX(MENU_ID) as maxId FROM MENU WHERE USER_ID IS NULL');
            log(`System Menu ID Range: ${ids[0].minId} - ${ids[0].maxId}`);
        }

        // 2. Check User Data (Custom Menus & Hidden Menus)
        // We'll take the first user found or a specific ID if provided
        const [users] = await pool.query('SELECT USER_ID, USER_NAME FROM USER LIMIT 1');
        if (users.length > 0) {
            const userId = users[0].USER_ID;
            log(`Checking User: ${users[0].USER_NAME} (ID: ${userId})`);

            const [custom] = await pool.query('SELECT COUNT(*) as count FROM MENU WHERE USER_ID = ?', [userId]);
            log(`Custom Menus Created: ${custom[0].count}`);

            const [hidden] = await pool.query('SELECT COUNT(*) as count FROM USER_HIDDEN_MENU WHERE USER_ID = ?', [userId]);
            log(`System Menus Hidden: ${hidden[0].count}`);
        } else {
            log('No users found.');
        }

        fs.writeFileSync('debug_output.txt', output.join('\n'));
        console.log('Debug complete. Output written to debug_output.txt');

    } catch (e) {
        log(`ERROR: ${e.message}`);
        fs.writeFileSync('debug_output.txt', output.join('\n'));
    } finally {
        pool.end();
    }
}

debugDeep();
