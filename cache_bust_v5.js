const fs = require('fs');
const path = require('path');

const clientDir = 'd:/ecommerce_git/client';
const files = fs.readdirSync(clientDir);

files.forEach(file => {
    if (file.endsWith('.html')) {
        const filePath = path.join(clientDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;

        if (content.includes('components.js')) {
            content = content.replace(/components\.js(\?v=\d+)?/g, 'components.js?v=5');
            changed = true;
        }

        if (content.includes('3d-preview.js')) {
            content = content.replace(/3d-preview\.js(\?v=\d+)?/g, '3d-preview.js?v=5');
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(filePath, content);
            console.log(`Cache busted ${file} to v=5`);
        }
    }
});
