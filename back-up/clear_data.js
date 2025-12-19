const mysql = require('mysql2/promise');
require('dotenv').config();

async function clearData() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('Connecting to Database...');

        console.log('Deleting all data from HISTORY...');
        await pool.execute('DELETE FROM HISTORY');

        console.log('Deleting all data from USER...');
        await pool.execute('DELETE FROM USER');

        console.log('Data cleared successfully! You can now start fresh.');
        process.exit(0);
    } catch (err) {
        console.error('Error clearing data:', err);
        process.exit(1);
    }
}

clearData();
