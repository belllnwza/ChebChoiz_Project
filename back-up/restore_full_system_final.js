const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    try {
        console.log('--- FINAL FULL SYSTEM RESTORE (USER PROVIDED DATA) ---');

        // 1. Clear System Categories (ID 1001 - 1081)
        console.log("Clearing old system categories...");
        await pool.query("DELETE FROM MENU_CATEGORY WHERE MENU_ID BETWEEN 1001 AND 1081");

        // 2. Insert The Correct Categories (User Provided)
        console.log("Inserting correct categories...");
        const sql = `
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1001, 10005); -- Suki Shabu (Buffet)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1002, 10005); -- Moo Krata (Buffet)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1003, 10008); -- Mala (Chainese)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1004, 10007); -- Pizza (Italian)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1005, 10009); -- Cake (Dessert)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1006, 10006); -- Som Tam (Thai)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1007, 10001); -- Burger (All Cate)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1008, 10002); -- Pad Thai (Noodle)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1009, 10003); -- Donburi (Rice)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1010, 10003); -- Fried rice (Rice)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1011, 10007); -- Spaghetti (Italian)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1012, 10002); -- Ramen (Noodle)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1013, 10009); -- Macaron (Dessert)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1014, 10007); -- Steak (Italian)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1015, 10005); -- Grill & BBQ (Buffet)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1016, 10004); -- Mushroom Soup (Soup)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1017, 10002); -- Yakisoba (Noodle)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1018, 10008); -- Dim Sum (Chainese)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1019, 10009); -- Ice Cream (Dessert)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1020, 10001); -- Sandwich (All Cate)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1021, 10004); -- Tomato Soup (Soup)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1022, 10009); -- Brownie (Dessert)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1023, 10001); -- Sausage (All Cate)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1024, 10005); -- Hot Pot (Buffet)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1025, 10003); -- Sushi (Rice)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1026, 10009); -- Doughnut (Dessert)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1027, 10003); -- Pork Porridge (Rice)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1028, 10004); -- Pumpkin Soup (Soup)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1029, 10009); -- Bingsu (Dessert)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1030, 10007); -- Meatballs (Italian)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1031, 10006); -- Pad See Ew (Thai)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1032, 10005); -- Salad Bar (Buffet)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1033, 10005); -- Seafood (Buffet)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1034, 10004); -- Pork Bone Soup (Soup)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1035, 10003); -- Chicken Basil (Rice)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1036, 10002); -- Yen Ta Fo (Noodle)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1037, 10001); -- Omelet (All Cate)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1038, 10003); -- Beef Bowl (Rice)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1039, 10002); -- Boat Noodles (Noodle)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1040, 10007); -- Lasagna (Italian)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1041, 10008); -- Steamed Egg Bun (Chainese)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1042, 10006); -- Mango Sticky Rice (Thai)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1043, 10009); -- Honey Toast (Dessert)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1044, 10001); -- French Fries (All Cate)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1045, 10001); -- Nachos (All Cate)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1047, 10003); -- Shrimp Fried Rice (Rice)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1048, 10004); -- Kimchi Soup (Soup)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1049, 10007); -- Risotto (Italian)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1050, 10003); -- Curry Rice (Rice)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1051, 10009); -- Tart (Dessert)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1052, 10007); -- Mac & Cheese (Italian)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1053, 10004); -- Corn Cream (Soup)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1054, 10004); -- Tom Yum (Soup)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1055, 10003); -- Pineapple Fried Rice (Rice)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1056, 10003); -- Hainanese Chicken Rice (Rice)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1057, 10002); -- Hokkien Mee (Noodle)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1058, 10002); -- Kuay Jub (Noodle)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1059, 10004); -- Sichuan Soup (Soup)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1060, 10005); -- Chocolate Buffet (Buffet)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1061, 10004); -- Fish Maw Soup (Soup)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1062, 10001); -- Beef Wellington (All Cate)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1063, 10001); -- Boston Lobster (All Cate)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1064, 10005); -- Fresh Berry Buffet (Buffet)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1065, 10002); -- Fettuccine Alfredo (Noodle)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1066, 10007); -- Herb Roasted Chicken (Italian)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1067, 10001); -- Foie Gras (All Cate)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1068, 10001); -- Nuggets (All Cate)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1069, 10001); -- Fish & Chips (All Cate)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1070, 10008); -- Mapo Tofu (Chainese)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1071, 10007); -- Garlic Bread (Italian)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1072, 10005); -- Sashimi Buffet (Buffet)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1073, 10001); -- Chicken Wrap (All Cate)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1074, 10009); -- Croissants (Dessert)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1075, 10002); -- Roast Duck Noodles (Noodle)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1076, 10001); -- Chicken Wings (All Cate)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1077, 10002); -- Udon (Noodle)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1078, 10009); -- Cheesecake (Dessert)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1079, 10003); -- American Fried Rice (Rice)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1080, 10004); -- Abalone Soup (Soup)

            -- Add Cate More
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1046, 10002); -- Rad Na (Noodle)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1046, 10006); -- Rad na (Thai)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1008, 10006); -- Pad Thai (Thai)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1010, 10006); -- Fried rice (Thai)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1018, 10005); -- Dim Sum (Buffet)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1021, 10007); -- Tomato Soup (Italian)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1025, 10001); -- Sushi (All Cate)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1035, 10006); -- Chicken Basil (Thai)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1042, 10009); -- Mango Sticky Rice (Dessert)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1047, 10006); -- Shrimp Fried Rice (Thai)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1049, 10003); -- Risotto (Rice)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1003, 10004); -- Mala (Soup)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1005, 10005); -- Cake (Buffet)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1011, 10002); -- Spaghetti (Noodle)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1036, 10006); -- Yen Ta Fo (Thai)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1031, 10002); -- Pad See Ew (Noodle)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1039, 10006); -- Boat Noodles (Thai)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1024, 10008); -- Hot Pot (Chainese)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1054, 10006); -- Tom Yum (Thai)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1055, 10006); -- Pineapple Fried Rice (Thai)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1056, 10006); -- Hainanese Chicken Rice (Thai)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1058, 10008); -- Kuay Jub (Chainese)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1059, 10008); -- Sichuan Soup (Chainese)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1060, 10009); -- Chocolate Buffet (Dessert)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1061, 10008); -- Fish Maw Soup (Chainese)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1064, 10009); -- Fresh Berry Buffet (Dessert)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1065, 10007); -- Fettuccine Alfredo (Italian) 
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1075, 10008); -- Roast Duck Noodles (Chainese)
            INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (1080, 10008); -- Abalone Soup (Chainese)
        `;

        // Execute the Batch SQL
        // Split by semicolon because node-mysql2 doesn't like huge specific blocks sometimes or to be safe
        const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
        for (const stmt of statements) {
            try {
                await pool.query(stmt);
            } catch (e) {
                // Ignore duplicate errors if any, but log others
                if (e.code !== 'ER_DUP_ENTRY') console.error("Error executing:", stmt.substring(0, 50), e.message);
            }
        }

        console.log("✅ Full Restore Complete.");

    } catch (e) { console.error(e); } finally { pool.end(); }
}
run();
