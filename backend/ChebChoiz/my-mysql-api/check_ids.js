require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => 
{
    try 
    {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        const [rows] = await conn.query("SELECT MENU_ID, MENU_NAME FROM MENU");
        console.log("IDS:", JSON.stringify(rows));
        await conn.end();
        process.exit(0);
    } 
    catch (e) 
    {
        console.error(e);
        process.exit(1);
    }
})();
