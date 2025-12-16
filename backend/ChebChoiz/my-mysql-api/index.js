const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Database Connection ---
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- Constants & Data ---
const menuImages = {
    1001: 'img/shabu.jpg', 1002: 'img/mookrata.jpg', 1003: 'img/mala.jpg', 1004: 'img/pizza.webp',
    1005: 'img/cake.jpg', 1006: 'img/somtam.jpg', 1007: 'img/burger.jpg', 1008: 'img/padtai.jpg',
    1009: 'img/donburi.jpg', 1010: 'img/firedrice.webp', 1011: 'img/spaghetti.webp', 1012: 'img/ramen.webp',
    1013: 'img/macaron.jpg', 1014: 'img/steak.jpg', 1015: 'img/grillandbbq.png', 1016: 'img/mushroom_soup.jpg',
    1017: 'img/yakisoba.jpg', 1018: 'img/dimsum.jpg', 1019: 'img/icecream.jpg', 1020: 'img/sandwich.jpg',
    1021: 'img/tomatosoup.jpg', 1022: 'img/brownie.jpg', 1023: 'img/sausage.jpg', 1024: 'img/hotpot.jpg',
    1025: 'img/yentafo.jpg', 1026: 'img/tart.jpg', 1027: 'img/sushi.jpg', 1028: 'img/steamedeggbuns.jpg',
    1029: 'img/shrimpfriedrice.jpg', 1030: 'img/seafood.jpg', 1031: 'img/saladbar.webp', 1032: 'img/radna.webp',
    1033: 'img/pumpkinsoup.jpg', 1034: 'img/risotto.jpg', 1035: 'img/porkporridge.webp', 1036: 'img/padseeew.jpg',
    1037: 'img/omelet.webp', 1038: 'img/nachos.jpg', 1039: 'img/meatballs.jpg', 1040: 'img/mangostickyrice.jpg',
    1041: 'img/lasagna.webp', 1042: 'img/kimchisoup.webp', 1043: 'img/honeytoast.jpg', 1044: 'img/frenchfries.jpg',
    1045: 'img/doughnut.webp', 1046: 'img/curryrice.webp', 1047: 'img/chickenbasil.jpg', 1048: 'img/boatnoodles.webp',
    1049: 'img/bingsu.webp', 1050: 'img/beefbowl.jpg', 1052: 'img/macandcheese.jpg', 1053: 'img/corncream.jpg',
    1054: 'img/tomyum.jpg', 1055: 'img/pineapplefriedrice.jpg', 1056: 'img/hainanesechickenrice.webp',
    1057: 'img/hokkeinmee.jpg', 1058: 'img/kuayjub.jpg', 1059: 'img/sichuansoup.webp', 1060: 'img/chocolatebuffet.jpg',
    1061: 'img/fishmawsoup.webp', 1062: 'img/beefwellington.jpg', 1063: 'img/bostonlobster.jpg',
    1064: 'img/freshberrybuffet.jpg', 1065: 'img/fettuccinealfredo.jpg', 1066: 'img/herbroastedchicken.jpg',
    1067: 'img/foiegras.jpg', 1068: 'img/nuggets.jpg', 1069: 'img/fishchips.webp', 1070: 'img/mapotofu.jpg',
    1071: 'img/garlicbread.jpg', 1072: 'img/sashimi.jpg', 1073: 'img/chickenwrap.jpg', 1074: 'img/croissants.jpg',
    1075: 'img/roastducknoodles.jpg', 1076: 'img/chickenwings.webp', 1077: 'img/udon.jpg', 1078: 'img/cheesecake.jpg',
    1079: 'img/americanfriedrice.webp', 1080: 'img/abalonesoup.webp', 1081: 'img/porkbonesoup.webp'
};

// --- Initialization Logic ---
async function initDbUpdates() {
    try {
        const connection = await pool.getConnection();

        // 1. Add PASSWORD to USER if not exists
        try {
            await connection.query(`SELECT PASSWORD FROM USER LIMIT 1`);
        } catch (e) {
            console.log('Adding PASSWORD column to USER table...');
            await connection.query(`ALTER TABLE USER ADD COLUMN PASSWORD VARCHAR(255) DEFAULT '1234'`);
        }

        // 2. Add IMAGE_URL and USER_ID to MENU if not exists
        try {
            await connection.query(`SELECT IMAGE_URL FROM MENU LIMIT 1`);
        } catch (e) {
            console.log('Adding IMAGE_URL column to MENU table...');
            await connection.query(`ALTER TABLE MENU ADD COLUMN IMAGE_URL VARCHAR(255)`);
        }

        try {
            await connection.query(`SELECT USER_ID FROM MENU LIMIT 1`);
        } catch (e) {
            console.log('Adding USER_ID column to MENU table...');
            await connection.query(`ALTER TABLE MENU ADD COLUMN USER_ID INT DEFAULT NULL`);
        }

        // [FIX] Ensure MENU_ID is INT to handle IDs > 32767 just in case it was SMALLINT
        try {
            await connection.query(`ALTER TABLE MENU MODIFY MENU_ID INT`);
        } catch (e) {
            console.log('Skipping MENU_ID modification (likely constraint error or already INT):', e.message);
        }

        // 3. Create USER_HIDDEN_MENU table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS USER_HIDDEN_MENU (
                USER_ID INT,
                MENU_ID INT,
                PRIMARY KEY (USER_ID, MENU_ID)
            )
        `);

        // --- SEEDING LOGIC ---
        // Only run seeding if we detect missing images/data to avoid overhead
        const [check] = await connection.query(`SELECT IMAGE_URL FROM MENU WHERE MENU_ID = 1001`);
        if (!check[0] || !check[0].IMAGE_URL) {
            console.log('Seeding Image URLs...');

            for (const [id, url] of Object.entries(menuImages)) {
                await connection.query('UPDATE MENU SET IMAGE_URL = ? WHERE MENU_ID = ?', [url, id]);
            }

            // Seed by name (fallback/extras)
            const nameImages = { "Grill & BBQ": "img/grillandbbq.png" };
            for (const [name, url] of Object.entries(nameImages)) {
                await connection.query('UPDATE MENU SET IMAGE_URL = ? WHERE LOWER(MENU_NAME) = LOWER(?)', [url, name.trim()]);
            }
        }

        connection.release();
        console.log('✅ Database Schema verified/updated.');
    } catch (error) {
        console.error('❌ Database Initialization Error:', error);
    }
}

initDbUpdates();

// Helper to map price level 1-5 to DB params
function mapPriceLevel(level) {
    const map = { 1: 10002, 2: 10003, 3: 10004, 4: 10005, 5: 10006 };
    return map[level] || 10002;
}

// ==========================================
//              API ENDPOINTS
// ==========================================

// 1. REGISTER
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    console.log(`[REGISTER] Attempt: ${username}`);

    try {
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Missing fields' });
        }

        const [existing] = await pool.execute('SELECT * FROM USER WHERE BINARY USER_NAME = ?', [username]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        // Generate new ID (Max + 1)
        const [rows] = await pool.execute('SELECT MAX(USER_ID) as maxId FROM USER');
        let maxId = Number(rows[0].maxId);

        if (!maxId || maxId < 10000) {
            maxId = 10000;
        }

        const newId = maxId + 1;
        await pool.execute('INSERT INTO USER (USER_ID, USER_NAME, PASSWORD) VALUES (?, ?, ?)', [newId, username, password]);

        console.log(`[REGISTER] Success: ${username}`);
        res.json({ success: true, message: 'User registered successfully' });

    } catch (err) {
        console.error('[REGISTER] Error:', err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
});

// 2. LOGIN
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`[LOGIN] Attempt: ${username}`);

    try {
        const [users] = await pool.execute('SELECT * FROM USER WHERE BINARY USER_NAME = ? AND BINARY PASSWORD = ?', [username, password]);

        if (users.length > 0) {
            console.log(`[LOGIN] Success: ${username}`);
            res.json({
                success: true,
                message: 'Login successful',
                user: { id: users[0].USER_ID, name: users[0].USER_NAME }
            });
        } else {
            console.log(`[LOGIN] Failed: Invalid creds for ${username}`);
            res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
    } catch (err) {
        console.error('[LOGIN] Error:', err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
});

// 3. RESET PASSWORD
app.post('/api/reset-password', async (req, res) => {
    const { username, new_password } = req.body;

    try {
        const [result] = await pool.execute('UPDATE USER SET PASSWORD = ? WHERE BINARY USER_NAME = ?', [new_password, username]);

        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Password updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (err) {
        console.error('[RESET] Error:', err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
});

// 4. GET OPTIONS (Categories & Situations)
app.get('/api/options', async (req, res) => {
    try {
        const [categories] = await pool.execute('SELECT CATE_ID as id, CATE_NAME as name FROM CATEGORY ORDER BY CATE_ID');
        const [situations] = await pool.execute('SELECT SIT_ID as id, SIT_NAME as name FROM SITUATION ORDER BY SIT_ID');
        res.json({ categories, situations });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 5. GET MENU (User Specific)
app.get('/api/menu', async (req, res) => {
    const userId = req.query.userId;

    try {
        let sql = `
            SELECT 
                m.MENU_ID as id,
                m.MENU_NAME as name,
                m.IMAGE_URL as image,
                GROUP_CONCAT(DISTINCT c.CATE_NAME SEPARATOR ', ') as category,
                p.PRICE_ID,
                CASE 
                    WHEN p.PRICE_ID = 10002 THEN 1
                    WHEN p.PRICE_ID = 10003 THEN 2
                    WHEN p.PRICE_ID = 10004 THEN 3
                    WHEN p.PRICE_ID = 10005 THEN 4
                    WHEN p.PRICE_ID = 10006 THEN 5
                    ELSE 0
                END as price,
                m.USER_ID as created_by
            FROM MENU m
            LEFT JOIN MENU_CATEGORY mc ON m.MENU_ID = mc.MENU_ID
            LEFT JOIN CATEGORY c ON mc.CATE_ID = c.CATE_ID
            JOIN PRICE p ON m.PRICE_ID = p.PRICE_ID
            WHERE 1=1
        `;

        const params = [];

        if (userId) {
            // Logic: Show (System Defined AND Not Hidden) OR (Created by User)
            sql += ` AND (
                (m.USER_ID IS NULL AND m.MENU_ID NOT IN (SELECT MENU_ID FROM USER_HIDDEN_MENU WHERE USER_ID = ?))
                OR (m.USER_ID = ?)
            )`;
            params.push(userId, userId);
        } else {
            // If no user, show system defaults only
            sql += ` AND m.USER_ID IS NULL`;
        }

        sql += ` GROUP BY m.MENU_ID, m.MENU_NAME, m.IMAGE_URL, p.PRICE_ID, m.USER_ID`;

        const [rows] = await pool.execute(sql, params);

        // Fetch Situations (Subquery approach for robustness)
        const fullRows = await Promise.all(rows.map(async (row) => {
            const [sits] = await pool.execute(`
                SELECT GROUP_CONCAT(s.SIT_NAME SEPARATOR ', ') as list, GROUP_CONCAT(s.SIT_NAME) as raw
                FROM MENU_SITUATION ms 
                JOIN SITUATION s ON ms.SIT_ID = s.SIT_ID 
                WHERE ms.MENU_ID = ?
             `, [row.id]);

            return {
                ...row,
                situation_list: sits[0].list,
                situationArray: sits[0].raw ? sits[0].raw.split(',') : []
            };
        }));

        const result = fullRows.map(row => ({
            id: row.id,
            name: row.name,
            price: row.price,
            category: row.category,
            situation: row.situation_list,
            situationArray: row.situationArray,
            image: row.image || 'img/Logo.png', // Rely on DB image
            is_custom: row.created_by != null
        }));

        res.json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
});

// 6. GET HISTORY
app.get('/api/history/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const sql = `
            SELECT 
                h.HISTORY_ID,
                m.MENU_NAME as name,
                m.IMAGE_URL as image,
                (SELECT GROUP_CONCAT(DISTINCT c2.CATE_NAME SEPARATOR ', ') 
                 FROM MENU_CATEGORY mc2 
                 JOIN CATEGORY c2 ON mc2.CATE_ID = c2.CATE_ID 
                 WHERE mc2.MENU_ID = m.MENU_ID) as category,
                p.RANGE_NAME as price_text, 
                DATE_FORMAT(h.SELECTION_DATE, '%d/%m/%Y') as date,
                (SELECT GROUP_CONCAT(s.SIT_NAME SEPARATOR ', ') 
                 FROM MENU_SITUATION ms 
                 JOIN SITUATION s ON ms.SIT_ID = s.SIT_ID 
                 WHERE ms.MENU_ID = m.MENU_ID) as situation
            FROM HISTORY h
            JOIN MENU m ON h.MENU_ID = m.MENU_ID
            JOIN PRICE p ON m.PRICE_ID = p.PRICE_ID
            WHERE h.USER_ID = ?
            ORDER BY h.SELECTION_DATE DESC
        `;
        const [rows] = await pool.execute(sql, [userId]);

        // Priority Overrides for problematic images (Name-based)
        const overrides = {
            "Yen ta fo": "img/yentafo.jpg", "Tart": "img/tart.jpg", "Sushi": "img/sushi.jpg",
            "Steamed Egg Bun": "img/steamedeggbuns.jpg", "Shrimp Fried Rice": "img/shrimpfriedrice.jpg",
            "Seafood": "img/seafood.jpg", "Salad Bar": "img/saladbar.webp", "rad na": "img/radna.webp",
            "Risotto": "img/risotto.jpg", "Pumpkin Soup": "img/pumpkinsoup.jpg", "Pork Porridge": "img/porkporridge.webp",
            "Pork Bone Soup": "img/porkbonesoup.webp", "Pad See Ew": "img/padseeew.jpg", "Omelet": "img/omelet.webp",
            "nachos": "img/nachos.jpg", "Meatballs": "img/meatballs.jpg", "Mango Sticky Rice": "img/mangostickyrice.jpg",
            "Lasagna": "img/lasagna.webp", "Kimchi Soup": "img/kimchisoup.webp", "Honey Toast": "img/honeytoast.jpg",
            "French Fries": "img/frenchfries.jpg", "Doughnut": "img/doughnut.webp", "Curry Rice": "img/curryrice.webp",
            "chicken basil": "img/chickenbasil.jpg", "Boat Noodles": "img/boatnoodles.webp", "Bingsu": "img/bingsu.webp",
            "Beef Bowl": "img/beefbowl.jpg", "Mac & Cheese": "img/macandcheese.jpg", "Corn Cream": "img/corncream.jpg",
            "Tom Yum": "img/tomyum.jpg", "Pineapple Fired Rice": "img/pineapplefriedrice.jpg",
            "Hainanese Chicken Rice": "img/hainanesechickenrice.webp", "Hokkien Mee": "img/hokkeinmee.jpg",
            "Kuay Jub": "img/kuayjub.jpg", "Sichuan Soup": "img/sichuansoup.webp", "Chocolate Buffet": "img/chocolatebuffet.jpg",
            "Fish Maw Soup": "img/fishmawsoup.webp", "Beef Wellington": "img/beefwellington.jpg",
            "Boston Lobster": "img/bostonlobster.jpg", "Fresh Berry Buffet": "img/freshberrybuffet.jpg",
            "Fettuccine Alfredo": "img/fettuccinealfredo.jpg", "Herb Roasted Chicken": "img/herbroastedchicken.jpg",
            "Foie Gras": "img/foiegras.jpg", "Nuggets": "img/nuggets.jpg", "Fish & Chips": "img/fishchips.webp",
            "Mapo Tofu": "img/mapotofu.jpg", "Garlic Bread": "img/garlicbread.jpg", "Sashimi Buffet": "img/sashimi.jpg",
            "Chicken Wrap": "img/chickenwrap.jpg", "Croissants": "img/croissants.jpg",
            "Roast Duck Noodles": "img/roastducknoodles.jpg", "Chicken Wings": "img/chickenwings.webp", "Udon": "img/udon.jpg",
            "Cheesecake": "img/cheesecake.jpg", "American Fried Rice": "img/americanfriedrice.webp",
            "Abalone Soup": "img/abalonesoup.webp"
        };
        const normalizeName = (name) => name.toLowerCase().trim();

        const result = rows.map(r => ({
            name: r.name,
            price: r.price_text + " Bath",
            category: r.category,
            situation: r.situation,
            date: r.date,
            image: overrides[normalizeName(r.name)] || r.image || 'img/Logo.png'
        }));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 7. ADD HISTORY
app.post('/api/history', async (req, res) => {
    const { userId, menuName } = req.body;

    try {
        // Use robust matching (Trim + Case Insensitive)
        const [menus] = await pool.execute('SELECT MENU_ID FROM MENU WHERE LOWER(MENU_NAME) = LOWER(?)', [menuName.trim()]);
        if (menus.length === 0) {
            console.log(`[HISTORY] Menu not found: '${menuName}'`);
            return res.status(404).json({ success: false, message: 'Menu not found' });
        }

        const menuId = menus[0].MENU_ID;

        const [rows] = await pool.execute('SELECT MAX(HISTORY_ID) as maxId FROM HISTORY');
        let currentMax = rows[0].maxId;
        // Ensure it's a number
        if (currentMax === null) currentMax = 10000;
        else currentMax = parseInt(currentMax);

        const newId = currentMax + 1;
        await pool.execute('INSERT INTO HISTORY (HISTORY_ID, USER_ID, MENU_ID, SELECTION_DATE) VALUES (?, ?, ?, NOW())',
            [newId, userId, menuId]);

        res.json({ success: true, message: 'History saved' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 8. ADD MENU (Custom)
app.post('/api/menu/add', async (req, res) => {
    const { userId, name, priceLevel, imageUrl, categoryIds, situationIds } = req.body;
    try {
        const [rows] = await pool.execute('SELECT MAX(MENU_ID) as maxId FROM MENU');
        let newId = (rows[0].maxId || 20000) + 1;
        if (newId < 20000) newId = 20000;

        const priceId = mapPriceLevel(priceLevel);

        await pool.execute(
            'INSERT INTO MENU (MENU_ID, MENU_NAME, PRICE_ID, IMAGE_URL, USER_ID, MENU_PRICE) VALUES (?, ?, ?, ?, ?, 0)',
            [newId, name, priceId, imageUrl, userId]
        );

        // Insert Categories
        if (categoryIds && Array.isArray(categoryIds)) {
            for (const cateId of categoryIds) {
                await pool.execute('INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (?, ?)', [newId, cateId]);
            }
        }

        // Insert Situations
        if (situationIds && Array.isArray(situationIds)) {
            for (const sitId of situationIds) {
                await pool.execute('INSERT INTO MENU_SITUATION (MENU_ID, SIT_ID) VALUES (?, ?)', [newId, sitId]);
            }
        }

        res.json({ success: true, message: 'Menu added', menuId: newId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 9. DELETE MENU (Hide or Delete)
app.post('/api/menu/delete', async (req, res) => {
    const { userId, menuId } = req.body;
    try {
        // Check if system or custom
        const [rows] = await pool.execute('SELECT USER_ID FROM MENU WHERE MENU_ID = ?', [menuId]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Menu not found' });

        const isCustom = rows[0].USER_ID != null;

        if (isCustom) {
            // Verify ownership
            if (rows[0].USER_ID != userId) return res.status(403).json({ success: false, message: 'Not authorized' });
            await pool.execute('DELETE FROM MENU WHERE MENU_ID = ?', [menuId]);
        } else {
            // System menu -> Hide it
            await pool.execute('INSERT IGNORE INTO USER_HIDDEN_MENU (USER_ID, MENU_ID) VALUES (?, ?)', [userId, menuId]);
        }
        res.json({ success: true, message: 'Menu deleted/hidden' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 10. EDIT MENU
app.post('/api/menu/edit', async (req, res) => {
    const { userId, menuId, name, priceLevel, imageUrl, categoryIds, situationIds } = req.body;
    try {
        const [rows] = await pool.execute('SELECT * FROM MENU WHERE MENU_ID = ?', [menuId]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Menu not found' });

        const existingMenu = rows[0];
        const isCustom = existingMenu.USER_ID != null;
        let finalMenuId = menuId;

        const priceId = mapPriceLevel(priceLevel);
        const finalImage = imageUrl || existingMenu.IMAGE_URL;

        if (isCustom) {
            if (existingMenu.USER_ID != userId) return res.status(403).json({ success: false, message: 'Not authorized' });

            await pool.execute(
                'UPDATE MENU SET MENU_NAME = ?, PRICE_ID = ?, IMAGE_URL = ? WHERE MENU_ID = ?',
                [name, priceId, finalImage, menuId]
            );
        } else {
            // System menu: Hide original, Create new custom copy
            await pool.execute('INSERT IGNORE INTO USER_HIDDEN_MENU (USER_ID, MENU_ID) VALUES (?, ?)', [userId, menuId]);

            const [maxRows] = await pool.execute('SELECT MAX(MENU_ID) as maxId FROM MENU');
            let newId = (maxRows[0].maxId || 20000) + 1;
            if (newId < 20000) newId = 20000;

            await pool.execute(
                'INSERT INTO MENU (MENU_ID, MENU_NAME, PRICE_ID, IMAGE_URL, USER_ID, MENU_PRICE) VALUES (?, ?, ?, ?, ?, 0)',
                [newId, name, priceId, finalImage, userId]
            );
            finalMenuId = newId;
        }

        // Update Categories/Situations (Delete old, Insert new)
        await pool.execute('DELETE FROM MENU_CATEGORY WHERE MENU_ID = ?', [finalMenuId]);
        await pool.execute('DELETE FROM MENU_SITUATION WHERE MENU_ID = ?', [finalMenuId]);

        if (categoryIds && Array.isArray(categoryIds)) {
            for (const cateId of categoryIds) {
                await pool.execute('INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (?, ?)', [finalMenuId, cateId]);
            }
        }
        if (situationIds && Array.isArray(situationIds)) {
            for (const sitId of situationIds) {
                await pool.execute('INSERT INTO MENU_SITUATION (MENU_ID, SIT_ID) VALUES (?, ?)', [finalMenuId, sitId]);
            }
        }

        res.json({ success: true, message: 'Menu edited' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 11. RESET MENU
app.post('/api/menu/reset', async (req, res) => {
    const { userId } = req.body;
    try {
        await pool.execute('DELETE FROM MENU WHERE USER_ID = ?', [userId]);
        await pool.execute('DELETE FROM USER_HIDDEN_MENU WHERE USER_ID = ?', [userId]);

        res.json({ success: true, message: 'Menus reset to default' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/menu/detail', async (req, res) => {
    const { userId, menuId } = req.body;
    try {
        const [rows] = await pool.execute('SELECT * FROM MENU WHERE MENU_ID = ?', [menuId]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Menu not found' });

        const menu = rows[0];

        // Fetch Categories
        const [categories] = await pool.execute(`
            SELECT c.CATE_ID, c.CATE_NAME 
            FROM MENU_CATEGORY mc 
            JOIN CATEGORY c ON mc.CATE_ID = c.CATE_ID 
            WHERE mc.MENU_ID = ?
        `, [menuId]);

        // Fetch Situations
        const [situations] = await pool.execute(`
            SELECT s.SIT_ID, s.SIT_NAME 
            FROM MENU_SITUATION ms 
            JOIN SITUATION s ON ms.SIT_ID = s.SIT_ID 
            WHERE ms.MENU_ID = ?
        `, [menuId]);

        // Add to response
        menu.categories = categories;
        menu.situations = situations;
        // Also helper arrays for easier frontend usage
        menu.categoryIds = categories.map(c => c.CATE_ID);
        menu.situationIds = situations.map(s => s.SIT_ID);

        res.json({ success: true, menu });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.listen(port, () => {
    console.log(`🚀 Server running on ${port}`);
});

