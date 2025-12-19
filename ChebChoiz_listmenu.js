const menuListContainer = document.getElementById('menu-list');
const userId            = localStorage.getItem('userId');

let isEditMode        = false;
let isDeleteMode      = false;
let selectedDeleteIds = new Set();
let allCategories     = [];
let allSituations     = [];

const modal              = document.getElementById('menuModal');
const closeBtn           = document.querySelector('.close-btn');
const menuForm           = document.getElementById('menuForm');
const modalTitle         = document.getElementById('modalTitle');
const menuIdInput        = document.getElementById('menuId');
const menuNameInput      = document.getElementById('menuName');
const menuPriceInput     = document.getElementById('menuPrice');
const menuImageInput     = document.getElementById('menuImage');
const categoryContainer  = document.getElementById('category-container');
const situationContainer = document.getElementById('situation-container');

const batchDeleteBar    = document.getElementById('batch-delete-bar');
const confirmDeleteBtn  = document.getElementById('confirm-delete-btn');
const selectedCountSpan = document.getElementById('selected-count');

const priceMapping = 
{
    1: "50-100 Bath",
    2: "100-150 Bath",
    3: "150-300 Bath",
    4: "300-450 Bath",
    5: "450 Bath Up"
};


async function fetchOptions() 
{
    try 
    {
        const res = await fetch('http://localhost:3000/api/options');
        if (!res.ok) throw new Error("Status " + res.status);
        const data    = await res.json();
        allCategories = data.categories || [];
        allSituations = data.situations || [];
    } 
    catch (e) 
    {
        console.error("Failed to fetch options", e);
    }
}

function renderCheckboxGroup(container, items, namePrefix, selectedIds = []) 
{
    container.innerHTML = '';
    items.forEach(item => 
        {
        const label     = document.createElement('label');
        label.className = 'checkbox-item';

        const checkbox = document.createElement('input');
        checkbox.type  = 'checkbox';
        checkbox.value = item.id;
        checkbox.name  = namePrefix;
        if (selectedIds.includes(item.id)) checkbox.checked = true;

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(item.name));
        container.appendChild(label);
    });
}

function renderMenu(data) 
{
    menuListContainer.innerHTML = '';

    if (!data || data.length === 0) 
    {
        menuListContainer.innerHTML = '<p style="text-align: center; color: gray;">ไม่พบรายการเมนู</p>';
        return;
    }

    data.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

    data.forEach(item => 
    {
        const card          = document.createElement('div');
        card.className      = 'history-card';
        card.style.position = 'relative';

        if (isDeleteMode) 
        {
            card.style.cursor = "pointer";
            const isSelected  = selectedDeleteIds.has(item.id);
            card.style.border = isSelected ? "3px solid #ff5252" : "1px solid #ddd";
            card.onclick = () => toggleDeleteSelection(item.id);
        } 
        else 
        {
            card.style.border = "none";
            card.style.cursor = "default";
            card.onclick      = null;
        }

        const finalImage = item.image || 'img/Logo.png';
        const priceText  = priceMapping[item.price] || "Unknown Price";

        const checkboxDisplay = isDeleteMode ? 'block' : 'none';
        const isChecked       = selectedDeleteIds.has(item.id) ? 'checked' : '';
        const editBtnDisplay  = isDeleteMode ? 'none' : 'flex';

        card.innerHTML = `
            <div class="card-checkbox-container" style="display: ${checkboxDisplay};">
                <input type="checkbox" class="card-checkbox" ${isChecked} disabled> 
            </div>

            <!-- New Direct Edit Button -->
            <button class="card-edit-btn" style="display: ${editBtnDisplay};" onclick="event.stopPropagation(); window.startEdit(${item.id})">
                <i class="fas fa-pen"></i>
            </button>

            <div class="card-image-container">
                <img src="${finalImage}?t=${new Date().getTime()}" alt="${item.name}" class="card-image" onerror="console.log('Failed to load:', this.src)">
            </div>
            
            <div class="card-details">
                <h3 class="card-menu-name">${item.name}</h3>
                <p class="card-price">Price         : ${priceText}</p>
                <p class="card-category">Category   : ${item.category || '-'}</p>
                <p class="card-situation">Situation : ${item.situation || '-'}</p>
            </div>
        `;

        const editBtn = card.querySelector('.card-edit-btn');
        if (editBtn) 
        {
            editBtn.onclick = (e) => 
            {
                e.stopPropagation();
                openEditModal(item);
            };
        }

        menuListContainer.appendChild(card);
    });
}

function toggleDeleteSelection(id) 
{
    if (selectedDeleteIds.has(id)) 
    {
        selectedDeleteIds.delete(id);
    } 
    else 
    {
        selectedDeleteIds.add(id);
    }
    updateBatchDeleteUI();
    loadMenuFromApi(); 
}

function updateBatchDeleteUI() 
{
    selectedCountSpan.textContent = selectedDeleteIds.size;
    batchDeleteBar.style.display  = isDeleteMode ? 'block' : 'none';
}

async function executeBatchDelete() 
{
    if (selectedDeleteIds.size === 0) return alert("Select items to delete");
    if (!confirm(`Delete ${selectedDeleteIds.size} items?`)) return;

    const deletePromises = Array.from(selectedDeleteIds).map(id => deleteMenu(id, true));
    await Promise.all(deletePromises);

    alert("Deleted successfully");
    selectedDeleteIds.clear();
    isDeleteMode = false;
    updateBatchDeleteUI();
    loadMenuFromApi();
}


async function loadMenuFromApi() 
{
    try 
    {
        if (!userId) 
        {
            menuListContainer.innerHTML = '<p style="text-align:center;">Please Log In</p>';
            return;
        }

        const response = await fetch(`http://localhost:3000/api/menu?userId=${userId}&t=${Date.now()}`);
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        renderMenu(data);
    } 
    catch (e) 
    {
        console.error(e);
        menuListContainer.innerHTML = '<p>cannot load the menu</p>';
    }
}

async function deleteMenu(menuId, silent = false) 
{
    try 
    {
        const response = await fetch('http://localhost:3000/api/menu/delete', {
            method  : 'POST',
            headers : { 'Content-Type': 'application/json' },
            body    : JSON.stringify({ userId, menuId })
        });
        const res = await response.json();

        if (res.success) 
        {
            if (!silent) 
            {
                alert('Deleted successfully');
                loadMenuFromApi();
            }
        } 
        else 
        {
            console.error('Error deleting ' + menuId + ': ' + res.message);
        }
    } 
    catch (e) 
    {
        console.error(e);
        if (!silent) alert('Failed to delete menu');
    }
}

async function resetMenu() 
{
    if (!confirm("Do you want to clear all changes and revert to the default settings? (This action is irreversible.)")) return;

    const userId = localStorage.getItem('userId');

    if (!userId) 
    {
        alert("Error: User ID not found. Please verify you are logged in.");
        return;
    }

    try 
    {
        const response = await fetch('http://localhost:3000/api/menu/reset', 
        {
            method  : 'POST',
            headers : 
            {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: userId })
        });

        const result = await response.json();

        if (result.success) 
        {
            alert("Menu Reset Successful");
            location.reload();
        } 
        else 
        {
            alert('Failed to reset menus: ' + (result.message || 'Unknown error'));
        }
    } 
    catch (error) 
    {
        console.error('Error resetting menu:', error);
        alert('Error resetting menu: ' + error.message);
    }
}

function openAddModal() 
{
    modalTitle.textContent = "Add Menu";
    menuIdInput.value      = "";
    menuNameInput.value    = "";
    menuPriceInput.value   = "1";
    menuImageInput.value   = "";

    renderCheckboxGroup(categoryContainer, allCategories, "category");
    renderCheckboxGroup(situationContainer, allSituations, "situation");

    modal.style.display = "block";
}

async function openEditModal(item) 
{
    modalTitle.textContent = "Edit Menu";
    menuIdInput.value      = item.id;
    menuNameInput.value    = item.name;
    menuPriceInput.value   = item.price;
    menuImageInput.value   = item.image;

    try 
    {
        const response = await fetch('http://localhost:3000/api/menu/detail', 
        {
            method  : 'POST',
            headers : { 'Content-Type': 'application/json' },
            body    : JSON.stringify({ userId, menuId: item.id })
        });
        const res = await response.json();

        if (res.success && res.menu) 
        {
            const { categoryIds, situationIds, MENU_NAME, PRICE_ID, IMAGE_URL } = res.menu;

            renderCheckboxGroup(categoryContainer, allCategories, "category", categoryIds || []);
            renderCheckboxGroup(situationContainer, allSituations, "situation", situationIds || []);

            modal.style.display = "block";
        } 
        else 
        {
            alert("Failed to load menu details");
        }
    } 
    catch (e) 
    {
        console.error(e);
        alert("Error loading details");
    }
}

closeBtn.onclick  = () => modal.style.display = "none";
window.onclick    = (event) => { if (event.target == modal) modal.style.display = "none"; };

menuForm.onsubmit = async (e) => 
{
    e.preventDefault();

    const id         = menuIdInput.value;
    const name       = menuNameInput.value;
    const priceLevel = menuPriceInput.value;
    const imageUrl   = menuImageInput.value.trim() || 'img/default.png';

    const categoryIds  = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(cb => parseInt(cb.value));
    const situationIds = Array.from(document.querySelectorAll('input[name="situation"]:checked')).map(cb => parseInt(cb.value));

    const endpoint      = id ? 'http://localhost:3000/api/menu/edit' : 'http://localhost:3000/api/menu/add';
    const body          = { userId, name, priceLevel, imageUrl, categoryIds, situationIds };
    if (id) body.menuId = id;

    try 
    {
        const response = await fetch(endpoint, 
        {
            method  : 'POST',
            headers : { 'Content-Type': 'application/json' },
            body    : JSON.stringify(body)
        });
        const res = await response.json();

        if (res.success) 
        {
            alert('Saved successfully');
            modal.style.display = "none";
            loadMenuFromApi();
        } 
        else 
        {
            alert('Error: ' + res.message);
        }
    } 
    catch (err) 
    {
        console.error(err);
        alert('Server Error');
    }
};

document.addEventListener('DOMContentLoaded', () => 
{

    fetchOptions().then(() => 
    {
        loadMenuFromApi();
    });

    document.querySelector('.Arrow_container').addEventListener('click', (e) => 
    {
        e.preventDefault();
        window.location.href = 'ChebChoiz_main.html';
    });

    const RESET_BTN = document.querySelector(".reset_icon");
    const BIN_BTN   = document.querySelector(".bin_icon");
    const EDIT_BTN  = document.querySelector(".edit_icon");
    const ADD_BTN   = document.querySelector(".add_icon");

    RESET_BTN.addEventListener('click', (e) => 
    {
        e.preventDefault();
        resetMenu();
    });

    BIN_BTN.addEventListener('click', (e) => 
    {
        e.preventDefault();
        isDeleteMode = !isDeleteMode;
        isEditMode   = false; 

        if (isDeleteMode) 
        {
            alert("Delete Mode ON: Select items and click 'Delete Selected'");
            BIN_BTN.style.opacity = "0.5";
        } 
        else 
        {
            selectedDeleteIds.clear();
            alert("Delete Mode OFF");
            BIN_BTN.style.opacity = "1";
        }

        updateBatchDeleteUI();
        loadMenuFromApi();
    });

    confirmDeleteBtn.addEventListener('click', (e) => 
    {
        e.preventDefault();
        executeBatchDelete();
    });

    if (EDIT_BTN) 
    {
        EDIT_BTN.style.display = 'none'; 
    }

    ADD_BTN.addEventListener('click', (e) => 
    {
        e.preventDefault();
        openAddModal();
    });
});
