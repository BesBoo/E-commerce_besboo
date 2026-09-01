const fs = require('fs');
const targetPath = 'd:/ecommerce_git/client/categories.html';
let content = fs.readFileSync(targetPath, 'utf8');

const danglingCatch = `catch (error) {
                console.error('Error loading navigation categories:', error);
                Utils.showToast('Không thể tải danh mục', 'error');
            }
        }`;

if (content.includes(danglingCatch)) {
    content = content.replace(danglingCatch, '');
    console.log('Successfully removed dangling catch block.');
} else {
    // If exact match fails, fallback to regex
    const regex = /catch\s*\(error\)\s*\{\s*console\.error\('Error loading navigation categories:', error\);\s*Utils\.showToast\('Không thể tải danh mục', 'error'\);\s*\}\s*\}/;
    if (regex.test(content)) {
        content = content.replace(regex, '');
        console.log('Successfully removed dangling catch block via regex.');
    } else {
        console.log('Could not find dangling catch block.');
    }
}

fs.writeFileSync(targetPath, content);
