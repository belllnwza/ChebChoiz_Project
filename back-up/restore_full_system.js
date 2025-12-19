const mysql = require('mysql2/promise');
require('dotenv').config();

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

async function restore() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('--- RESTORING 80 SYSTEM MENUS ---');

        // Optional: Clear broken/null system menus first?
        // await pool.query('DELETE FROM MENU WHERE USER_ID IS NULL');

        let restored = 0;
        for (const [id, url] of Object.entries(menuImages)) {
            // Derive name from URL: "img/porkbonesoup.webp" -> "Pork Bonesoup" (approx)
            // Better: "img/shabu.jpg" -> "Shabu"
            const filename = url.split('/')[1].split('.')[0];
            // Simple capitalization
            const name = filename.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

            // Default Price ID 10003 (Level 2), Menu Price 0
            // USER_ID MUST BE NULL for System Menu
            const sql = `
                INSERT IGNORE INTO MENU (MENU_ID, MENU_NAME, PRICE_ID, IMAGE_URL, MENU_PRICE, USER_ID)
                VALUES (?, ?, 10003, ?, 0, NULL)
            `;

            const [res] = await pool.query(sql, [id, name, url]);
            if (res.affectedRows > 0) restored++;
        }

        console.log(`Restored ${restored} missing system menus.`);

        // Clear Hidden Menus (Force Reset for everyone to see the new data)
        await pool.query('DELETE FROM USER_HIDDEN_MENU');
        console.log('Cleared all hidden menu records (System Reset).');

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

restore();
