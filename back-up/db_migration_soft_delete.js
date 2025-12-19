const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        const connection = await pool.getConnection();
        console.log("Connected to database...");

        // 1. Add IS_DELETED column
        try {
            console.log("Adding IS_DELETED column...");
            await connection.query("ALTER TABLE MENU ADD COLUMN IS_DELETED TINYINT DEFAULT 0");
            console.log("✅ IS_DELETED column added.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("ℹ️ IS_DELETED column already exists.");
            } else {
                console.error("❌ Error adding IS_DELETED:", e.message);
            }
        }

        // 2. Modify MENU_ID to INT (Fix Out of Range)
        try {
            console.log("Modifying MENU_ID to INT...");
            // We need to temporarily disable foreign key checks to modify the primary key type if needed
            // But usually modify column is fine if compatible, but MENU_ID is referenced by many tables.
            // This might fail if constraints are strict. Let's try simple MODIFY first.
            await connection.query("SET FOREIGN_KEY_CHECKS=0");
            await connection.query("ALTER TABLE MENU MODIFY MENU_ID INT");
            await connection.query("ALTER TABLE MENU_CATEGORY MODIFY MENU_ID INT");
            await connection.query("ALTER TABLE MENU_SITUATION MODIFY MENU_ID INT");
            await connection.query("ALTER TABLE HISTORY MODIFY MENU_ID INT");
            await connection.query("ALTER TABLE USER_HIDDEN_MENU MODIFY MENU_ID INT");
            await connection.query("SET FOREIGN_KEY_CHECKS=1");
            console.log("✅ MENU_ID changed to INT.");
        } catch (e) {
            console.error("❌ Error modifying MENU_ID:", e.message);
        }

        connection.release();
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        pool.end();
    }
}

migrate();
