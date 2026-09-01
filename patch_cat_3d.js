const fs = require('fs');

// 1. Patch categories.html
const catPath = 'd:/ecommerce_git/client/categories.html';
let catContent = fs.readFileSync(catPath, 'utf8');

// Remove await loadNavCategories();
catContent = catContent.replace(/\s*\/\/\s*Load navigation categories\s*await loadNavCategories\(\);/, '');

// Remove loadNavCategories function
const loadNavRegex = /\s*\/\/\s*Load navigation categories\s*async function loadNavCategories\(\) \{[\s\S]*?\}\s*\}\s*/;
catContent = catContent.replace(loadNavRegex, '');
catContent = catContent.replace(/\r\n/g, '\n');

// Also update cache buster for components.js and 3d-preview.js to v=6
catContent = catContent.replace(/components\.js\?v=\d+/g, 'components.js?v=6');
catContent = catContent.replace(/3d-preview\.js\?v=\d+/g, '3d-preview.js?v=6');

fs.writeFileSync(catPath, catContent);
console.log('Successfully patched categories.html');

// 2. Patch 3d-preview.js
const previewPath = 'd:/ecommerce_git/client/js/3d-preview.js';
let previewContent = fs.readFileSync(previewPath, 'utf8');

if (!previewContent.includes('.global-3d-loading {')) {
    const loadingStyle = `
            .global-3d-loading {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: flex;
                flex-direction: column;
                align-items: center;
                color: #fff;
                font-family: var(--font-body, sans-serif);
                font-weight: 600;
                z-index: 10000;
                gap: 15px;
            }
            .global-3d-loading .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid rgba(255,255,255,0.3);
                border-top: 4px solid #fff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
        \`;`;
    previewContent = previewContent.replace('`;', loadingStyle);
    fs.writeFileSync(previewPath, previewContent);
    console.log('Successfully patched 3d-preview.js');
} else {
    console.log('3d-preview.js already patched');
}
