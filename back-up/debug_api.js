const fetch = require('node-fetch');

async function checkMenu() {
    try {
        const response = await fetch('http://localhost:3000/api/menu');
        const data = await response.json();

        const grill = data.find(d => d.name.includes('Grill') || d.name.includes('BBQ'));
        if (grill) {
            console.log('Found Grill & BBQ item:');
            console.log(JSON.stringify(grill, null, 2));
        } else {
            console.log('Grill & BBQ not found in API response');
        }
    } catch (e) {
        console.error('Error fetching API:', e.message);
    }
}

checkMenu();
