const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function diagnose() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    let output = '';
    const log = (msg) => {
        console.log(msg);
        output += msg + '\n';
    };

    try {
        log('--- DIAGNOSTIC START ---');

        // 1. ALL USERS
        const [users] = await pool.query('SELECT * FROM USER');
        log(`Total Users: ${users.length}`);
        if (users.length > 0) {
            log(`Sample User: ID=${users[0].USER_ID}, Name=${users[0].USER_NAME}`);
        }

        // 2. SYSTEM MENUS (USER_ID IS NULL)
        const [sysMenus] = await pool.query('SELECT MENU_ID, MENU_NAME, USER_ID FROM MENU WHERE USER_ID IS NULL OR USER_ID = 0');
        log(`System Menus (USER_ID IS NULL or 0): ${sysMenus.length}`);
        if (sysMenus.length < 5 && sysMenus.length > 0) log(JSON.stringify(sysMenus));
        if (sysMenus.length === 0) log('!! NO SYSTEM MENUS FOUND !!');

        // 3. CHECK HIDDEN MENUS
        const [hidden] = await pool.query('SELECT * FROM USER_HIDDEN_MENU');
        log(`Hidden Menu Records: ${hidden.length}`);
        if (hidden.length > 0) log('Sample Hidden:' + JSON.stringify(hidden[0]));

        fs.writeFileSync(path.join(__dirname, 'diagnose_out.txt'), output);
        console.log('Written to diagnose_out.txt');

    } catch (e) {
        console.error(e);
        fs.writeFileSync(path.join(__dirname, 'diagnose_out.txt'), output + '\nERROR: ' + e.message);
    } finally {
        pool.end();
    }
}

diagnose();
