const axios = require('axios');

async function testEditApi() {
    const baseUrl = 'http://localhost:3000/api';
    const userId = 10001; // Assume a valid user ID

    console.log("--- 1. Testing Get Detail (Shabu - 1001) ---");
    try {
        const res = await axios.post(`${baseUrl}/menu/detail`, { userId, menuId: 1001 });
        console.log("Detail Status:", res.status);
        console.log("Detail Data:", res.data.success ? "Found" : res.data);
    } catch (e) {
        console.error("Detail Error:", e.message);
    }

    console.log("\n--- 2. Testing Edit (System -> Custom) ---");
    // This should hide 1001 for this user and create a new custom menu
    try {
        const editPayload = {
            userId,
            menuId: 1001,
            name: "Shabu Special Edition",
            priceLevel: "5",
            imageUrl: "img/shabu.jpg",
            categoryIds: [10005], // Buffet
            situationIds: [20001] // Example situation
        };
        const res = await axios.post(`${baseUrl}/menu/edit`, { ...editPayload });
        console.log("Edit Status:", res.status);
        console.log("Edit Response:", res.data);
    } catch (e) {
        console.error("Edit Error:", e.response ? e.response.data : e.message);
    }
}

testEditApi();
