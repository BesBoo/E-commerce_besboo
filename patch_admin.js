const fs = require('fs');
const targetPath = 'd:/ecommerce_git/client/js/admin.js';

let content = fs.readFileSync(targetPath, 'utf8');
content = content.replace(/\r\n/g, '\n');

const oldString = `    document.getElementById('btn-apply-order-filters').addEventListener('click', () => {
        loadOrders(1);
    // Product Filters`;

const newString = `    document.getElementById('btn-apply-order-filters').addEventListener('click', () => {
        loadOrders(1);
    });
    
    // Product Filters`;

if (content.includes(oldString)) {
    content = content.replace(oldString, newString);
    console.log('Successfully fixed admin.js missing brace');
}

const oldEndString = `    loadCategoriesForSelect();
    loadProducts(1);

    });
    document.getElementById('dashboard-date-filter')`;

const newEndString = `    loadCategoriesForSelect();
    loadProducts(1);

    document.getElementById('dashboard-date-filter')`;

if (content.includes(oldEndString)) {
    content = content.replace(oldEndString, newEndString);
    console.log('Successfully removed trailing brace in admin.js');
}

fs.writeFileSync(targetPath, content);
