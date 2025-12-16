const fetch = require('node-fetch');

async function testOptions() {
    try {
        console.log("Fetching options...");
        const res = await fetch('http://localhost:3000/api/options');
        if (!res.ok) {
            console.log("Error status:", res.status);
            return;
        }
        const data = await res.json();
        console.log("Categories:", data.categories);
        console.log("Situations:", data.situations);
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}
testOptions();
