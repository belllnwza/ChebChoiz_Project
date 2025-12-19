const mysql = require('mysql2/promise');
require('dotenv').config();

// 1. Authoritative Source from index.js
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

// 2. Logic: Map Keywords to Category IDs
const rules = [
    { id: 10009, name: 'Dessert', keywords: ['cake', 'brownie', 'tart', 'toast', 'bingsu', 'macaron', 'icecream', 'doughnut', 'chocolate', 'berry', 'croissant', 'cheesecake', 'mangostickyrice'] },
    { id: 10004, name: 'Soup', keywords: ['soup', 'tomyum', 'hotpot', 'mala', 'yentafo', 'suki'] }, // Mala/Shabu also soup base often
    { id: 10005, name: 'Buffet', keywords: ['buffet', 'shabu', 'mookrata', 'bbq', 'seafood', 'hotpot'] },
    { id: 10002, name: 'Noodle', keywords: ['noodle', 'ramen', 'soba', 'udon', 'pasta', 'spaghetti', 'fettuccine', 'padtai', 'yakisoba', 'yentafo', 'padseeew', 'kuayjub', 'hokkeinmee'] },
    { id: 10003, name: 'Rice', keywords: ['rice', 'donburi', 'bibimbap', 'porridge', 'sushi', 'risotto', 'curryrice', 'beefbowl', 'chickenbasil'] },
    { id: 10007, name: 'Italian', keywords: ['pizza', 'lasagna', 'spaghetti', 'fettuccine', 'risotto', 'carbonara', 'macandcheese'] },
    { id: 10006, name: 'Thai', keywords: ['somtam', 'padtai', 'curry', 'tomyum', 'stickyrice', 'basil', 'boatnoodles', 'padseeew', 'hainanese', 'kuayjub'] },
    { id: 10008, name: 'Chinese', keywords: ['dimsum', 'mala', 'bun', 'mapotofu', 'duck', 'abalone', 'fishmaw'] },
    { id: 10001, name: 'General/Appetizer', keywords: ['burger', 'steak', 'sandwich', 'fries', 'nuggets', 'chips', 'nachos', 'wings', 'saladbar', 'chickenwrap', 'wellington', 'lobster', 'foiegras', 'omelet', 'meatballs', 'garlicbread'] }
];

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    try {
        console.log('--- CORRECTING CATEGORIES (V2) ---');

        let totalInserts = 0;

        // Prepare Batch Delete & Insert
        for (const [idStr, url] of Object.entries(menuImages)) {
            const menuId = parseInt(idStr);
            const filename = url.split('/').pop().toLowerCase();

            // 1. Find matched categories
            const matchedCateIds = new Set();
            for (const rule of rules) {
                if (rule.keywords.some(k => filename.includes(k))) {
                    matchedCateIds.add(rule.id);
                }
            }

            // Fallback: If no match, defaulting to 10001
            if (matchedCateIds.size === 0) matchedCateIds.add(10001);

            // 2. Perform DB Updates
            // Clean old
            await pool.query('DELETE FROM MENU_CATEGORY WHERE MENU_ID = ?', [menuId]);

            // Insert new
            for (const cateId of matchedCateIds) {
                await pool.query('INSERT INTO MENU_CATEGORY (MENU_ID, CATE_ID) VALUES (?, ?)', [menuId, cateId]);
                totalInserts++;
            }
            console.log(`Updated #${menuId} (${filename}): [${Array.from(matchedCateIds).join(', ')}]`);
        }

        console.log(`✅ Fixed All Categories. Total Assignments: ${totalInserts}`);

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

run();
