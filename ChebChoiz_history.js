const historyListContainer = document.getElementById('history-list');

function parseDate(dateString) {
    const parts = dateString.split('/');
    return new Date(parts[2], parts[1] - 1, parts[0]);
}

function parsePriceRange(priceString) {
    try {
        const numbers = priceString.match(/\d+(\s*-\s*\d+)?/);
        if (numbers) {
            const range = numbers[0].split('-').map(s => Number(s.trim()));
            if (range.length === 2) {
                return (range[0] + range[1]) / 2;
            }
            else if (range.length === 1 && !isNaN(range[0])) {
                return range[0];
            }
        }
        return 0;
    }
    catch (e) {
        console.error("Error parsing price:", priceString, e);
        return 0;
    }
}

function renderHistory(data) {
    historyListContainer.innerHTML = '';

    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
        loadingMessage.style.display = 'none';
    }

    if (data.length === 0) {
        historyListContainer.innerHTML = '<p style="text-align: center; color: gray;">ไม่พบประวัติการสุ่มที่บันทึกไว้</p>';
        return;
    }

    const imageOverrides = {
        "mushroom soup": "img/mushroom_soup.jpg",
        "grill & bbq": "img/grillandbbq.png",
        "yakisoba": "img/yakisoba.jpg",
        "steak": "img/steak.jpg",
        "sandwich": "img/sandwich.jpg",
        "yen ta fo": "img/yentafo.jpg",
        "tart": "img/tart.jpg",
        "sushi": "img/sushi.jpg",
        "steamed egg bun": "img/steamedeggbuns.jpg",
        "shrimp fried rice": "img/shrimpfriedrice.jpg",
        "seafood": "img/seafood.jpg",
        "salad bar": "img/saladbar.webp",
        "rad na": "img/radna.webp",
        "risotto": "img/risotto.jpg",
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
        "beef bowl": "img/beefbowl.jpg",
        "mac & cheese": "img/macandcheese.jpg",
        "corn cream": "img/corncream.jpg",
        "tom yum": "img/tomyum.jpg",
        "pineapple fired rice": "img/pineapplefriedrice.jpg",
        "hainanese chicken rice": "img/hainanesechickenrice.webp",
        "hokkien mee": "img/hokkeinmee.jpg",
        "kuay jub": "img/kuayjub.jpg",
        "sichuan soup": "img/sichuansoup.webp",
        "chocolate buffet": "img/chocolatebuffet.jpg",
        "fish maw soup": "img/fishmawsoup.webp",
        "beef wellington": "img/beefwellington.jpg",
        "boston lobster": "img/bostonlobster.jpg",
        "fresh berry buffet": "img/freshberrybuffet.jpg",
        "fettuccine alfredo": "img/fettuccinealfredo.jpg",
        "herb roasted chicken": "img/herbroastedchicken.jpg",
        "foie gras": "img/foiegras.jpg",
        "nuggets": "img/nuggets.jpg",
        "fish & chips": "img/fishchips.webp",
        "mapo tofu": "img/mapotofu.jpg",
        "garlic bread": "img/garlicbread.jpg",
        "sashimi buffet": "img/sashimi.jpg",
        "chicken wrap": "img/chickenwrap.jpg",
        "croissants": "img/croissants.jpg",
        "roast duck noodles": "img/roastducknoodles.jpg",
        "chicken wings": "img/chickenwings.webp",
        "udon": "img/udon.jpg",
        "cheesecake": "img/cheesecake.jpg",
        "american fried rice": "img/americanfriedrice.webp",
        "abalone soup": "img/abalonesoup.webp"
    };

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'history-card';

        const cleanName = item.name.toLowerCase().trim();
        const finalImage = imageOverrides[cleanName] || item.image;

        card.innerHTML = `
            <div class="card-image-container">
                <img src="${finalImage}?t=${new Date().getTime()}" alt="${item.name}" class="card-image" onerror="console.log('Failed to load:', this.src)">
            </div>
            <div class="card-details">
                <h3 class="card-menu-name">${item.name}</h3>
                <p class="card-price">Price : ${item.price}</p>
                <p class="card-category">Category : ${item.category}</p>
                <p class="card-situation">Situation : ${item.situation}</p>
            </div>
            <span class="card-date">DATE : ${item.date}</span>
        `;

        historyListContainer.appendChild(card);
    });
}

function loadAndSortHistory(data, sortOrder) {
    const sortedData = [...data].sort((a, b) => {

        switch (sortOrder) {
            case 'oldest':
                return parseDate(a.date) - parseDate(b.date);
            case 'price-low':
                return parsePriceRange(a.price) - parsePriceRange(b.price);
            case 'price-high':
                return parsePriceRange(b.price) - parsePriceRange(a.price);
            case 'latest':
            default:
                return parseDate(b.date) - parseDate(a.date);
        }
    });

    renderHistory(sortedData);
}

async function loadHistoryFromApi(sortOrder) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        historyListContainer.innerHTML = '<p>กรุณาล็อกอินเพื่อดูประวัติ</p>';
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/history/${userId}`);
        const data = await response.json();

        loadAndSortHistory(data, sortOrder);
    }
    catch (e) {
        console.error(e);
        historyListContainer.innerHTML = '<p>ไม่สามารถโหลดประวัติได้</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const userNameDisplay = document.getElementById('user-name-display');
    const userIdDisplay = document.getElementById('user-id-display');

    if (localStorage.getItem('userName')) {
        userNameDisplay.textContent = localStorage.getItem('userName');
    }
    if (localStorage.getItem('userId')) {
        userIdDisplay.textContent = localStorage.getItem('userId');
    }

    const initialSortOrder = 'latest';
    const filterDropdown = document.getElementById('sort-by');

    if (filterDropdown) {
        filterDropdown.value = initialSortOrder;

        filterDropdown.addEventListener('change', (e) => {
            const selectedSortOrder = e.target.value;
            loadHistoryFromApi(selectedSortOrder);
        });
    }

    loadHistoryFromApi(initialSortOrder);

    document.querySelector('.Arrow_container').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'ChebChoiz_main.html';
    });

    document.querySelector('.logout-btn').addEventListener('click', () => {
        alert('Log Out! Going to login page.');
        localStorage.clear();
        window.location.href = 'ChebChoiz_login.html';
    });
});