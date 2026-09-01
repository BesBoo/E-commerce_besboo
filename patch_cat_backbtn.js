const fs = require('fs');
const targetPath = 'd:/ecommerce_git/client/categories.html';
let content = fs.readFileSync(targetPath, 'utf8');

// The original code has:
// const backToCategories = document.getElementById('backToCategories');
// if (backToCategories) {
//     backToCategories.addEventListener('click', (e) => {
//         e.preventDefault();
//         backToCategories();
//     });
// }

const regex = /const\s+backToCategories\s*=\s*document\.getElementById\('backToCategories'\);\s*if\s*\(backToCategories\)\s*\{\s*backToCategories\.addEventListener\('click',\s*\(e\)\s*=>\s*\{\s*e\.preventDefault\(\);\s*backToCategories\(\);\s*\}\);\s*\}/;

const replacement = `const backBtn = document.getElementById('backToCategories');
            if (backBtn) {
                backBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    backToCategories();
                });
            }`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(targetPath, content);
    console.log('Successfully fixed backToCategories shadowing bug.');
} else {
    console.log('Could not find backToCategories event listener block.');
}
