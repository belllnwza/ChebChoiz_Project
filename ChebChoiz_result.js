document.addEventListener('DOMContentLoaded', () => 
{
    const randomBtn          = document.querySelector('.random-btn');
    const acceptBtn          = document.querySelector('.accept-btn');
    const historyBtn         = document.querySelector('.history-btn');
    const userContainer      = document.querySelector('.image_container');
    const arrowBackContainer = document.querySelector('.Arrow_container');

    const mainTitle = document.querySelector('.main-title');
    const mealImage = document.querySelector('.meal-image');

    const priceBox     = document.querySelector('.price-box');
    const categoryBox  = document.querySelector('.category-box');
    const situationBox = document.querySelector('.situation-box');

    const getPriceText = (level) => {
        const prices   =
        {
            1: "50 - 100 Bath",
            2: "100 - 150 Bath",
            3: "150 - 300 Bath",
            4: "300 - 450 Bath",
            5: "450 Bath Up"
        };
        return prices[parseInt(level)] || "Unknown Price";
    };



    const initialName  = localStorage.getItem('chosenMenuName');
    const initialImage = localStorage.getItem('chosenMenuImage');
    const seenMenus    = new Set();

    if (initialName) seenMenus.add(initialName);

    if (!initialName) 
    {
        window.location.href = 'ChebChoiz_main.html';
        return;
    }

    if (initialName && mainTitle) mainTitle.textContent = initialName;
    if (initialImage && mealImage) 
    {
        const finalImage = initialImage || 'img/Logo.png';
        mealImage.src = `${finalImage}?t=${new Date().getTime()}`;
        mealImage.alt = initialName;
    }

    const initialDetails = JSON.parse(localStorage.getItem('chosenMenuDetails') || 'null');
    if (initialDetails) 
    {
        if (priceBox) priceBox.textContent         = `Price     : ${getPriceText(initialDetails.price)}`;
        if (categoryBox) categoryBox.textContent   = `Category  : ${initialDetails.category}`;
        if (situationBox) situationBox.textContent = `Situation : ${initialDetails.situation}`;
    }

    const handleRandomClick = async () => 
    {
        try 
        {
            const userId = localStorage.getItem('userId');
            if (!userId) return alert("Please log in");

            const response  = await fetch(`http://localhost:3000/api/menu?userId=${userId}`);
            const allDishes = await response.json();

            const savedFilters = JSON.parse(localStorage.getItem('activeFilters') || '{}');

            let filtered = allDishes.filter(dish => 
            {
                const meetsPrice     = savedFilters.price     === null || savedFilters.price     === undefined || dish.price === savedFilters.price;
                const meetsCategory  = savedFilters.category  === null || savedFilters.category  === undefined || dish.category.includes(savedFilters.category);
                const meetsSituation = savedFilters.situation === null || savedFilters.situation === undefined || dish.situationArray.includes(savedFilters.situation);
                const notSeen = !seenMenus.has(dish.name);
                return meetsPrice && meetsCategory && meetsSituation && notSeen;
            });

            if (filtered.length === 0) 
            {
                if (seenMenus.size > 0) 
                {
                    alert('All options shown! Starting over with full list.');
                    seenMenus.clear();
                    await handleRandomClick();
                    return;
                } 
                else 
                {
                    alert('No menus match your current filters. Please go back and change filters.');
                    return;
                }
            }

            const randomIndex = Math.floor(Math.random() * filtered.length);
            const newMenu = filtered[randomIndex];

            seenMenus.add(newMenu.name);

            if (mainTitle) mainTitle.textContent = newMenu.name;
            if (mealImage) 
            {
                const finalImage = newMenu.image || 'img/Logo.png';

                mealImage.src = `${finalImage}?t=${new Date().getTime()}`;
                mealImage.alt = newMenu.name;

                console.log("Loading image:", mealImage.src);
            }

            if (priceBox) priceBox.textContent         = `Price     : ${getPriceText(newMenu.price)}`;
            if (categoryBox) categoryBox.textContent   = `Category  : ${newMenu.category}`;
            if (situationBox) situationBox.textContent = `Situation : ${newMenu.situation}`;

        }
        catch (error) 
        {
            console.error('Error fetching menu for random:', error);
        }
    };

    const handleAcceptClick = async () => 
    {
        const currentMenu     = mainTitle ? mainTitle.textContent : "Choosen Menu";
        const currentImageSrc = mealImage ? mealImage.src : "";
        const userId          = localStorage.getItem('userId');

        if (userId) 
        {
            try 
            {
                await fetch('http://localhost:3000/api/history',
                    {
                        method : 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body   : JSON.stringify({ userId, menuName: currentMenu })
                    });
            }
            catch (e) 
            {
                console.error("Failed to save history:", e);
            }
        }

        localStorage.setItem('chosenMenuName', currentMenu);
        localStorage.setItem('chosenMenuImage', currentImageSrc);

        window.location.href = 'ChebChoiz_congrat.html';
    };

    const handleHistoryClick = (e) => 
    {
        e.preventDefault();
        window.location.href = 'ChebChoiz_history.html';
    };

    const handleArrowBackClick = (e) => 
    {
        window.location.href = 'ChebChoiz_main.html';
    };

    if (arrowBackContainer) 
    {
        arrowBackContainer.addEventListener('click', handleArrowBackClick);
        arrowBackContainer.style.cursor = 'pointer';
    }

    if (randomBtn) 
    {
        randomBtn.addEventListener('click', handleRandomClick);
    }

    if (acceptBtn) 
    {
        acceptBtn.addEventListener('click', handleAcceptClick);
    }

    if (historyBtn) 
    {
        historyBtn.addEventListener('click', handleHistoryClick);
    }

    if (userContainer) 
    {
        userContainer.addEventListener('click', handleHistoryClick);
    }
});