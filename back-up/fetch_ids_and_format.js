require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const [rows] = await conn.query("SELECT MENU_ID, MENU_NAME FROM MENU");

        const targetMap = {
            "yen ta fo": "img/yentafo.jpg",
            "tart": "img/tart.jpg",
            "sushi": "img/sushi.jpg",
            "steamed egg bun": "img/steamedeggbuns.jpg",
            "shrimp fried rice": "img/shrimpfriedrice.jpg",
            "seafood": "img/seafood.jpg",
            "salad bar": "img/saladbar.webp",
            "rad na": "img/risotto.jpg",
            "pumpkin soup": "img/pumpkinsoup.jpg",
            "pork porridge": "img/porkporridge.webp",
            "pork bone soup": "img/porkbonesoup.webp",
            "pad see ew": "img/padseeew.jpg",
            "omelet": "img/omelet.webp",
            "nachos": "img/nachos.jpg",
            "meatballs": "img/meatballs.jpg",
            "mango sticky rice": "img/mangostickyrice.jpg",
            "lasagna": "img/lasagna.webp",
            "kimchi soup": "img/kimchisoup.webp",
            "honey toast": "img/honeytoast.jpg",
            "french fries": "img/frenchfries.jpg",
            "doughnut": "img/doughnut.webp",
            "curry rice": "img/curryrice.webp",
            "chicken basil": "img/chickenbasil.jpg",
            "boat noodles": "img/boatnoodles.webp",
            "bingsu": "img/bingsu.webp",
            "beef bowl": "img/beefbowl.jpg"
        };

        const foundEntries = [];

        rows.forEach(row => {
            const lowerName = row.MENU_NAME.toLowerCase().trim();
            if (targetMap[lowerName]) {
                foundEntries.push(`    ${row.MENU_ID}: '${targetMap[lowerName]}', // ${row.MENU_NAME}`);
            }
        });

        console.log("---------- START COPY ----------");
        console.log(foundEntries.join('\n'));
        console.log("---------- END COPY ----------");

        await conn.end();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
