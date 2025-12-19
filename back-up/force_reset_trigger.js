const fetch = require('node-fetch');

async function triggerRepair() {
    try {
        // Use a dummy userId (or real one if found 10001)
        // Since my logic repairs SYSTEM menus globally, any user ID works to trigger the 'ensureSystemMenus' call.
        const response = await fetch('http://localhost:3000/api/menu/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 10001 })
        });
        const res = await response.json();
        console.log('Repair Triggered:', res);
    } catch (e) {
        console.log('Error triggering repair:', e.message);
    }
}
triggerRepair();
