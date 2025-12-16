document.addEventListener('DOMContentLoaded', () => {

    const LOGIN_PAGE_URL        = "ChebChoiz_loadpage.html";
    const HISTORY_USER_PAGE_URL = "ChebChoiz_history.html";
    const CONFIRM_MENU_PAGE_URL = "ChebChoiz_result.html";

    let dishes = [];

    const gridContainer   = document.querySelector('.menu-grid');
    const filterDropdowns = document.querySelectorAll('.filter-dropdown');
    const diceContainer   = document.getElementById('diceContainer');
    const historyButton   = document.getElementById('historyButton');
    const userButton      = document.getElementById('userButton');

    let currentFilters = 
    {
        price     : null,
        category  : null,
        situation : null
    };

    const shuffleArray = (array) => 
    {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) 
        {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const fetchMenu = async () => 
    {
        try 
        {
            const response = await fetch('http://localhost:3000/api/menu');
            const result   = await response.json();

            dishes = shuffleArray(result);
            renderDishes(dishes);
        } 
        catch (error) 
        {
            console.error('Error fetching menu:', error);
            gridContainer.innerHTML = '<p class="error">ไม่สามารถโหลดข้อมูลเมนูได้</p>';
        }
    };

    const renderDishes = (dishArray) => 
    {
        gridContainer.innerHTML = '';

        if (dishArray.length === 0) 
        {
            gridContainer.innerHTML = '<p class="no-result">ไม่พบเมนูอาหารที่ตรงกับตัวกรอง</p>';
        }

        dishArray.slice(0, 12).forEach(dish => 
        {
            const item = document.createElement('div');
            item.classList.add('grid-item');

            const imageOverrides = 
            {
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
                "beef bowl": "img/beefbowl.jpg"
                
            };

            const finalImage = imageOverrides[dish.name.toLowerCase().trim()] || dish.image;

            item.innerHTML = `
                <img src="${finalImage}?t=${new Date().getTime()}" alt="${dish.name}" class="dish-image">
                <p class="dish-name">${dish.name}</p>
            `;

            item.title = `ราคา: ${dish.price}, ประเภท: ${dish.category}, มื้อ: ${dish.situation}`;
            gridContainer.appendChild(item);
        });

        const currentItems = gridContainer.querySelectorAll('.grid-item').length;
        for (let i = currentItems; i < 12; i++) 
        {
            const emptyItem = document.createElement('div');
            emptyItem.classList.add('grid-item', 'empty');
            gridContainer.appendChild(emptyItem);
        }
    };

    const applyFilters = () => {
        let filteredDishes = dishes;

        if (currentFilters.price !== null) 
        {
            filteredDishes = filteredDishes.filter(dish => dish.price === currentFilters.price);
        }

        if (currentFilters.category !== null) 
        {
            filteredDishes = filteredDishes.filter(dish => dish.category.includes(currentFilters.category));
        }

        if (currentFilters.situation !== null) 
        {
            filteredDishes = filteredDishes.filter(dish => dish.situationArray.includes(currentFilters.situation));
        }

        renderDishes(filteredDishes);
    };

    filterDropdowns.forEach(dropdown => 
    {
        const box        = dropdown.querySelector('.filter-box');
        const content    = dropdown.querySelector('.dropdown-content');
        const filterType = box.dataset.filterType;

        box.addEventListener('click', (e) => 
        {
            e.stopPropagation();

            filterDropdowns.forEach(d => 
            {
                if (d !== dropdown) 
                {
                    d.classList.remove('active');
                }
            });

            dropdown.classList.toggle('active');
        });

        content.querySelectorAll('a').forEach(link => 
        {
            link.addEventListener('click', (e) => 
            {
                e.preventDefault();
                const selectedValue = e.target.dataset.value;
                const displayValue  = e.target.textContent;

                if (filterType === 'price') 
                {
                    currentFilters[filterType] = selectedValue === 'null' ? null : parseInt(selectedValue);
                } 
                else 
                {
                    currentFilters[filterType] = selectedValue === 'null' ? null : selectedValue;
                }

                box.innerHTML = `${displayValue} <i class="fas fa-chevron-down"></i>`;

                dropdown.classList.remove('active');
                applyFilters();
            });
        });
    });

    document.addEventListener('click', () => 
    {
        filterDropdowns.forEach(d => d.classList.remove('active'));
    });

    const randomizeFood = () => 
    {

        let dishesToRandomize = dishes.filter(dish => 
        {
            const meetsPrice     = currentFilters.price     === null || dish.price === currentFilters.price;
            const meetsCategory  = currentFilters.category  === null || dish.category.includes(currentFilters.category);
            const meetsSituation = currentFilters.situation === null || dish.situationArray.includes(currentFilters.situation);
            return meetsPrice && meetsCategory && meetsSituation;
        });

        if (dishesToRandomize.length === 0) 
        {
            alert('No random menu options were found. Please try changing the filters.');
            return;
        }

        diceContainer.classList.add('is-rolling');

        const rollDuration = 1500;

        setTimeout(() => 
        {

            diceContainer.classList.remove('is-rolling');

            const randomIndex  = Math.floor(Math.random() * dishesToRandomize.length);
            const selectedDish = dishesToRandomize[randomIndex];

            localStorage.setItem('chosenMenuName'   , selectedDish.name);
            localStorage.setItem('chosenMenuImage'  , selectedDish.image);
            localStorage.setItem('chosenMenuDetails', JSON.stringify(selectedDish));
            localStorage.setItem('activeFilters'    , JSON.stringify(currentFilters));

            window.location.href = CONFIRM_MENU_PAGE_URL;

        }, rollDuration);
    };



const arrowButton = document.querySelector('.Arrow');
if (arrowButton) 
{
    arrowButton.addEventListener('click', function () 
    {
        window.location.href = LOGIN_PAGE_URL;
    }) ;
    arrowButton.style.cursor = 'pointer';
}


    const navigateToHistoryUser = () => 
    {
        window.location.href = HISTORY_USER_PAGE_URL;
    };

    if (historyButton) 
    {
        historyButton.addEventListener('click', navigateToHistoryUser);
    }

    if (userButton) 
    {
        userButton.addEventListener('click', navigateToHistoryUser);
    }

    if (diceContainer) 
    {
        diceContainer.addEventListener('click', randomizeFood);
    }

    fetchMenu();

    const Menu_Link =document.querySelector('.menu-grid-container')
        Menu_Link.addEventListener('click', function (){
             window.location.href = "ChebChoiz_listmenu.html";
        }
    )
});