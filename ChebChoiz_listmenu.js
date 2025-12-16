const menuListContainer = document.getElementById('menu-list');
const userId = localStorage.getItem('userId');
let isEditMode = false;
let isDeleteMode = false;
let selectedDeleteIds = new Set();
let allCategories = [];
let allSituations = [];

// --- Modal Elements ---
const modal = document.getElementById('menuModal');
const closeBtn = document.querySelector('.close-btn');
const menuForm = document.getElementById('menuForm');
const modalTitle = document.getElementById('modalTitle');
const menuIdInput = document.getElementById('menuId');
const menuNameInput = document.getElementById('menuName');
const menuPriceInput = document.getElementById('menuPrice');
const menuImageInput = document.getElementById('menuImage');
const categoryContainer = document.getElementById('category-container');
const situationContainer = document.getElementById('situation-container');

// --- Batch Delete Elements ---
const batchDeleteBar = document.getElementById('batch-delete-bar');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const selectedCountSpan = document.getElementById('selected-count');

// --- Helper Data ---
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

const priceMapping = {
    1: "50-100 Bath",
    2: "100-150 Bath",
    3: "150-300 Bath",
    4: "300-450 Bath",
    5: "450 Bath Up"
};


// --- Core Functions ---

async function fetchOptions() {
    try {
        const res = await fetch('http://localhost:3000/api/options');
        if (!res.ok) throw new Error("Status " + res.status);
        const data = await res.json();
        allCategories = data.categories || [];
        allSituations = data.situations || [];

        // Debug
        // alert(`Loaded ${allCategories.length} categories and ${allSituations.length} situations`);
    } catch (e) {
        console.error("Failed to fetch options", e);
        // alert("Failed to fetch options: " + e.message);
    }
}

function renderCheckboxGroup(container, items, namePrefix, selectedIds = []) {
    container.innerHTML = '';
    items.forEach(item => {
        const label = document.createElement('label');
        label.className = 'checkbox-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = item.id;
        checkbox.name = namePrefix; // e.g., "category"
        if (selectedIds.includes(item.id)) checkbox.checked = true;

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(item.name));
        container.appendChild(label);
    });
}


function renderMenu(data) {
    menuListContainer.innerHTML = '';

    if (!data || data.length === 0) {
        menuListContainer.innerHTML = '<p style="text-align: center; color: gray;">ไม่พบรายการเมนู</p>';
        return;
    }

    // Sort Alphabetically
    data.sort((a, b) => a.name.localeCompare(b.name));

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'history-card';
        card.style.position = 'relative';

        // Border highlighting
        if (isEditMode) {
            card.style.border = "3px solid #ffca28";
            card.style.cursor = "pointer";
            card.onclick = () => openEditModal(item);
        } else if (isDeleteMode) {
            card.style.cursor = "pointer";
            const isSelected = selectedDeleteIds.has(item.id);
            card.style.border = isSelected ? "3px solid #ff5252" : "1px solid #ddd";
            card.onclick = () => toggleDeleteSelection(item.id);
        } else {
            card.style.border = "none";
            card.style.cursor = "default";
            card.onclick = null;
        }

        const cleanName = item.name.toLowerCase().trim();
        const finalImage = imageOverrides[cleanName] || item.image || 'img/Logo.png';
        const priceText = priceMapping[item.price] || "Unknown Price";

        // Checkbox only visible in delete mode (managed via CSS class .card-checkbox-container)
        const checkboxDisplay = isDeleteMode ? 'block' : 'none';
        const isChecked = selectedDeleteIds.has(item.id) ? 'checked' : '';

        card.innerHTML = `
            <div class="card-checkbox-container" style="display: ${checkboxDisplay};">
                <input type="checkbox" class="card-checkbox" ${isChecked} disabled> 
            </div>

            <div class="card-image-container">
                <img src="${finalImage}?t=${new Date().getTime()}" alt="${item.name}" class="card-image" onerror="console.log('Failed to load:', this.src)">
            </div>
            
            <div class="card-details">
                <h3 class="card-menu-name">${item.name}</h3>
                <p class="card-price">Price : ${priceText}</p>
                <p class="card-category">Category : ${item.category || '-'}</p>
                <p class="card-situation">Situation : ${item.situation || '-'}</p>
            </div>
        `;
        // Removed individual delete btn logic in favor of batch delete

        menuListContainer.appendChild(card);
    });
}

function toggleDeleteSelection(id) {
    if (selectedDeleteIds.has(id)) {
        selectedDeleteIds.delete(id);
    } else {
        selectedDeleteIds.add(id);
    }
    updateBatchDeleteUI();
    loadMenuFromApi(); // Re-render to show selection borders
}

function updateBatchDeleteUI() {
    selectedCountSpan.textContent = selectedDeleteIds.size;
    batchDeleteBar.style.display = isDeleteMode ? 'block' : 'none';
}

async function executeBatchDelete() {
    if (selectedDeleteIds.size === 0) return alert("Select items to delete");
    if (!confirm(`Delete ${selectedDeleteIds.size} items?`)) return;

    // Execute deletes in parallel
    const deletePromises = Array.from(selectedDeleteIds).map(id => deleteMenu(id, true)); // pass true to suppress individual alerts
    await Promise.all(deletePromises);

    alert("Deleted successfully");
    selectedDeleteIds.clear();
    // Keep delete mode on or turn off? Let's keep it on for now, or reset.
    // Resetting for cleaner flow
    isDeleteMode = false;
    updateBatchDeleteUI();
    loadMenuFromApi();
}


async function loadMenuFromApi() {
    try {
        if (!userId) {
            menuListContainer.innerHTML = '<p style="text-align:center;">Please Log In</p>';
            return;
        }

        const response = await fetch(`http://localhost:3000/api/menu?userId=${userId}`);
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        renderMenu(data);
    } catch (e) {
        console.error(e);
        menuListContainer.innerHTML = '<p>ไม่สามารถโหลดเมนูได้</p>';
    }
}

async function deleteMenu(menuId, silent = false) {
    try {
        const response = await fetch('http://localhost:3000/api/menu/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, menuId })
        });
        const res = await response.json();

        if (res.success) {
            if (!silent) {
                alert('Deleted successfully');
                loadMenuFromApi();
            }
        } else {
            console.error('Error deleting ' + menuId + ': ' + res.message);
        }
    } catch (e) {
        console.error(e);
        if (!silent) alert('Failed to delete menu');
    }
}

async function resetMenu() {
    if (!confirm("Reset all your menu changes to default? This cannot be undone.")) return;

    try {
        const response = await fetch('http://localhost:3000/api/menu/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        const res = await response.json();

        if (res.success) {
            alert('Menus reset successfully');
            loadMenuFromApi();
        }
    } catch (e) {
        console.error(e);
        alert('Failed to reset menus');
    }
}


// --- Modal Logic ---

function openAddModal() {
    modalTitle.textContent = "Add Menu";
    menuIdInput.value = "";
    menuNameInput.value = "";
    menuPriceInput.value = "1";
    menuImageInput.value = "";

    renderCheckboxGroup(categoryContainer, allCategories, "category");
    renderCheckboxGroup(situationContainer, allSituations, "situation");

    modal.style.display = "block";
}

async function openEditModal(item) {
    modalTitle.textContent = "Edit Menu";
    menuIdInput.value = item.id;
    menuNameInput.value = item.name;
    menuPriceInput.value = item.price;
    menuImageInput.value = item.image;

    // Fetch full details (Category/Situation IDs)
    try {
        const response = await fetch('http://localhost:3000/api/menu/detail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, menuId: item.id })
        });
        const res = await response.json();

        if (res.success && res.menu) {
            const { categoryIds, situationIds, MENU_NAME, PRICE_ID, IMAGE_URL } = res.menu;

            // Update fields closely with fresh DB data if needed, or trust `item`
            // Mapping price ID back to 1-5 level if needed, or just keep item.price

            renderCheckboxGroup(categoryContainer, allCategories, "category", categoryIds || []);
            renderCheckboxGroup(situationContainer, allSituations, "situation", situationIds || []);

            modal.style.display = "block";
        } else {
            alert("Failed to load menu details");
        }
    } catch (e) {
        console.error(e);
        alert("Error loading details");
    }
}

// Close Modal Events
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; };

// Form Submission
menuForm.onsubmit = async (e) => {
    e.preventDefault();

    const id = menuIdInput.value;
    const name = menuNameInput.value;
    const priceLevel = menuPriceInput.value;
    const imageUrl = menuImageInput.value;

    // Collect Checkboxes
    const categoryIds = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(cb => parseInt(cb.value));
    const situationIds = Array.from(document.querySelectorAll('input[name="situation"]:checked')).map(cb => parseInt(cb.value));

    const endpoint = id ? 'http://localhost:3000/api/menu/edit' : 'http://localhost:3000/api/menu/add';
    const body = { userId, name, priceLevel, imageUrl, categoryIds, situationIds };
    if (id) body.menuId = id;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const res = await response.json();

        if (res.success) {
            alert('Saved successfully');
            modal.style.display = "none";
            loadMenuFromApi();
        } else {
            alert('Error: ' + res.message);
        }
    } catch (err) {
        console.error(err);
        alert('Server Error');
    }
};


// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {

    fetchOptions().then(() => {
        loadMenuFromApi();
    });

    // Back Button
    document.querySelector('.Arrow_container').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'ChebChoiz_main.html';
    });

    // Icons
    const RESET_BTN = document.querySelector(".reset_icon");
    const BIN_BTN = document.querySelector(".bin_icon");
    const EDIT_BTN = document.querySelector(".edit_icon");
    const ADD_BTN = document.querySelector(".add_icon");

    RESET_BTN.addEventListener('click', (e) => {
        e.preventDefault();
        resetMenu();
    });

    BIN_BTN.addEventListener('click', (e) => {
        e.preventDefault();

        // Toggle Delete Mode
        isDeleteMode = !isDeleteMode;
        isEditMode = false; // Turn off edit mode if on

        if (isDeleteMode) {
            alert("Delete Mode ON: Select items and click 'Delete Selected'");
            BIN_BTN.style.opacity = "0.5";
        } else {
            selectedDeleteIds.clear();
            alert("Delete Mode OFF");
            BIN_BTN.style.opacity = "1";
        }
        updateBatchDeleteUI();
        loadMenuFromApi();
    });

    confirmDeleteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        executeBatchDelete();
    });

    EDIT_BTN.addEventListener('click', (e) => {
        e.preventDefault();
        isEditMode = !isEditMode;
        isDeleteMode = false; // Turn off delete mode if on
        selectedDeleteIds.clear(); // Clear selections
        updateBatchDeleteUI();
        if (isEditMode) {
            alert("Edit Mode ON: Click on a menu card to edit.");
            EDIT_BTN.style.opacity = "0.5"; // Visual feedback
        } else {
            alert("Edit Mode OFF");
            EDIT_BTN.style.opacity = "1";
        }
        loadMenuFromApi(); // Re-render to update click handlers and borders
    });

    ADD_BTN.addEventListener('click', (e) => {
        e.preventDefault();
        openAddModal();
    });
});
