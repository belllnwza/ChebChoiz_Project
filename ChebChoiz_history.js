const historyListContainer = document.getElementById('history-list');

function parseDate(dateString) 
{
    const parts = dateString.split('/');
    return new Date(parts[2], parts[1] - 1, parts[0]);
}

function parsePriceRange(priceString) 
{
    try 
    {
        const numbers = priceString.match(/\d+(\s*-\s*\d+)?/);
        if (numbers) 
        {
            const range = numbers[0].split('-').map(s => Number(s.trim()));
            if (range.length === 2) 
            {
                return (range[0] + range[1]) / 2;
            }
            else if (range.length === 1 && !isNaN(range[0])) 
            {
                return range[0];
            }
        }
        return 0;
    }
    catch (e) 
    {
        console.error("Error parsing price:", priceString, e);
        return 0;
    }
}

function renderHistory(data) 
{
    historyListContainer.innerHTML = '';

    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) 
    {
        loadingMessage.style.display = 'none';
    }

    if (!data || data.length === 0) 
    {
        historyListContainer.innerHTML = '<p style="text-align: center; color: gray;">No random selection history was found.</p>';
        return;
    }

    data.forEach(item => 
    {
        const card     = document.createElement('div');
        card.className = 'history-card';

        const cleanName   = item.name ? item.name.toLowerCase().trim() : 'unknown';
        const finalImage  = item.image || 'img/Logo.png';
        const displayDate = item.date || 'Unknown Date';

        card.innerHTML = `
            <div class="card-image-container">
                <img src="${finalImage}?t=${new Date().getTime()}" alt="${item.name}" class="card-image" onerror="console.log('Failed to load:', this.src)">
            </div>
            <div class="card-details">
                <h3 class="card-menu-name">${item.name}</h3>
                <p class="card-price">Price         : ${item.price || '-'}</p>
                <p class="card-category">Category   : ${item.category || '-'}</p>
                <p class="card-situation">Situation : ${item.situation || '-'}</p>
            </div>
            <span class="card-date">DATE : ${displayDate}</span>
        `;

        historyListContainer.appendChild(card);
    });
}

function loadAndSortHistory(data, sortOrder) 
{
    const sortedData = [...data].sort((a, b) => 
    {

        switch (sortOrder) 
        {
            case 'oldest'    :
                return parseDate(a.date) - parseDate(b.date);
            case 'price-low' :
                return parsePriceRange(a.price) - parsePriceRange(b.price);
            case 'price-high':
                return parsePriceRange(b.price) - parsePriceRange(a.price);
            case 'latest'    :
            default          :
                return parseDate(b.date) - parseDate(a.date);
        }
    });

    renderHistory(sortedData);
}

async function loadHistoryFromApi(sortOrder) 
{
    const userId = localStorage.getItem('userId');
    if (!userId) 
    {
        historyListContainer.innerHTML = '<p>Please log in to view your history.</p>';
        return;
    }

    try 
    {
        const response = await fetch(`http://localhost:3000/api/history/${userId}`);
        const data     = await response.json();

        loadAndSortHistory(data, sortOrder);
    }
    catch (e) 
    {
        console.error(e);
        historyListContainer.innerHTML = '<p>ไม่สามารถโหลดประวัติได้</p>';
    }
}

async function deleteMenu(id) 
{
    if (confirm("Are you sure you want to delete this menu item?")) 
    {
        try 
        {
            const response = await fetch(`/api/menus/${id}?user_id=${currentUserId}`, 
            {
                method: 'DELETE'
            });
            if (response.ok) 
            {
                alert("The menu has been successfully removed!");
                location.reload();
            } 
            else 
            {
                const errorData = await response.json();
                alert(`An error occurred while deleting the menu : ${errorData.error || response.statusText}`);
            }
        } 
        catch (error) 
        {
            console.error("Fetch Error:", error);
            alert("There was an error connecting to the network. Please try again.");
        }
    }
}

document.addEventListener('DOMContentLoaded', () => 
{
    const userNameDisplay = document.getElementById('user-name-display');
    const userIdDisplay   = document.getElementById('user-id-display');

    if (localStorage.getItem('userName')) 
    {
        userNameDisplay.textContent = localStorage.getItem('userName');
    }
    if (localStorage.getItem('userId')) 
    {
        userIdDisplay.textContent = localStorage.getItem('userId');
    }

    const initialSortOrder = 'latest';
    const filterDropdown   = document.getElementById('sort-by');

    if (filterDropdown) 
    {
        filterDropdown.value = initialSortOrder;

        filterDropdown.addEventListener('change', (e) => 
        {
            const selectedSortOrder = e.target.value;
            loadHistoryFromApi(selectedSortOrder);
        });
    }

    loadHistoryFromApi(initialSortOrder);

    document.querySelector('.Arrow_container').addEventListener('click', (e) => 
    {
        e.preventDefault();
        window.location.href = 'ChebChoiz_main.html';
    });

    document.querySelector('.logout-btn').addEventListener('click', () => 
    {
        alert('Log Out! Going to login page.');
        localStorage.clear();
        window.location.href = 'ChebChoiz_login.html';
    });
});