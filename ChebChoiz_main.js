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
        price    : null,
        category : null,
        situation: null
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

    const fetchMenu = async (currentUserId) => 
    {
        try 
        {
            if (!currentUserId) return;

            const response = await fetch(`http://localhost:3000/api/menu?userId=${currentUserId}`);
            if (!response.ok) throw new Error('Failed to fetch menus');

            const data = await response.json();

            dishes = data.map(item => ({
                name           : item.name,
                price          : item.price,
                category       : item.category || '', 
                situation      : item.situation || '',
                situationArray : item.situationArray || [],
                image          : item.image
            }));

            dishes = shuffleArray(dishes);

            applyFilters();
        } 
        catch (error) 
        {
            console.error('Error fetching menu:', error);
            gridContainer.innerHTML = '<p class="error-text">Unable to load menus. Please check server connection.</p>';
        }
    };

    const renderDishes = (dishArray) => 
    {
        gridContainer.innerHTML = '';

        if (dishArray.length === 0) {
            gridContainer.innerHTML = '<p class="no-result">ไม่พบเมนูอาหารที่ตรงกับตัวกรอง</p>';
        }

        dishArray.slice(0, 12).forEach(dish => 
        {
            const item = document.createElement('div');
            item.classList.add('grid-item');

            const finalImage = dish.image || 'img/Logo.png';

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

    const applyFilters = () => 
    {
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

            localStorage.setItem('chosenMenuName', selectedDish.name);
            localStorage.setItem('chosenMenuImage', selectedDish.image);
            localStorage.setItem('chosenMenuDetails', JSON.stringify(selectedDish));
            localStorage.setItem('activeFilters', JSON.stringify(currentFilters));

            window.location.href = CONFIRM_MENU_PAGE_URL;

        }, rollDuration);
    };



    const arrowButton = document.querySelector('.Arrow');
    if (arrowButton) 
    {
        arrowButton.addEventListener('click', function () 
        {
            window.location.href = LOGIN_PAGE_URL;
        });
        arrowButton.style.cursor = 'pointer';
    }


    const navigateToHistoryUser = () => 
    {
        window.location.href    = HISTORY_USER_PAGE_URL;
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

    const currentUserId = localStorage.getItem('userId');
    const userName      = localStorage.getItem('userName');

    fetchMenu(currentUserId);

    const Menu_Link = document.querySelector('.menu-grid-container')
    Menu_Link.addEventListener('click', function () {
        window.location.href = "ChebChoiz_listmenu.html";
    }
    )
});