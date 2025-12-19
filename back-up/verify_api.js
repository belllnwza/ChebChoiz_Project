const fetch = require('node-fetch'); // Assuming node-fetch is available or using native fetch in newer node

// If node-fetch isn't available, we'll try to use http module or just basic fetch if Node 18+
// To be safe let's just use native fetch (Node 18+) or fallback.
// Actually the user environment seems to be Node.js.

async function test() {
    console.log("1. Testing GET /api/options...");
    try {
        const res = await fetch('http://localhost:3000/api/options');
        const data = await res.json();
        console.log("   Categories:", data.categories ? data.categories.length : 0);
        console.log("   Situations:", data.situations ? data.situations.length : 0);

        if (data.categories.length > 0 && data.situations.length > 0) console.log("   ✅ PASSED");
        else console.log("   ❌ FAILED (Empty data)");
    } catch (e) {
        console.log("   ❌ FAILED (Connection error)", e.message);
    }

    // Prepare a mock user ID
    const userId = 10099; // Test user
    let newMenuId = 0;

    console.log("\n2. Testing POST /api/menu/add with Categories/Situations...");
    try {
        const body = {
            userId: userId,
            name: "Test Batch Item " + Date.now(),
            priceLevel: 1,
            imageUrl: "img/default.png",
            categoryIds: [1, 2], // Assuming 1 and 2 exist
            situationIds: [1]    // Assuming 1 exists
        };

        const res = await fetch('http://localhost:3000/api/menu/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.success) {
            console.log("   ✅ PASSED (ID: " + data.menuId + ")");
            newMenuId = data.menuId;
        } else {
            console.log("   ❌ FAILED", data.message);
        }
    } catch (e) {
        console.log("   ❌ FAILED", e.message);
    }

    if (newMenuId) {
        console.log("\n3. Verifying Saved Data (GET /api/menu)...");
        try {
            const res = await fetch(`http://localhost:3000/api/menu?userId=${userId}`);
            const menus = await res.json();
            const myMenu = menus.find(m => m.id === newMenuId);

            if (myMenu) {
                console.log("   Found Menu:", myMenu.name);
                console.log("   Category:", myMenu.category); // Should be string
                console.log("   Situation:", myMenu.situation); // Should be string

                // We expect non-null/non-dash values if everything worked
                if (myMenu.category && myMenu.category !== '-' && myMenu.situation && myMenu.situation !== '-') {
                    console.log("   ✅ PASSED (Data persisted)");
                } else {
                    console.log("   ❌ FAILED (Data missing)");
                }
            } else {
                console.log("   ❌ FAILED (Menu not found in list)");
            }
        } catch (e) {
            console.log("   ❌ FAILED", e.message);
        }

        console.log("\n4. Cleaning up (Delete)...");
        try {
            await fetch('http://localhost:3000/api/menu/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, menuId: newMenuId })
            });
            console.log("   ✅ Cleaned up");
        } catch (e) { console.log("   Warning: Cleanup failed"); }
    }
}

test();
