const fs = require('fs');
const targetPath = 'd:/ecommerce_git/client/js/admin.js';

let content = fs.readFileSync(targetPath, 'utf8');

const toastRegex = /const showToast = \(message, type = 'success'\) => \{\s*const container = document\.getElementById\('toast-container'\);\s*const toast = document\.createElement\('div'\);\s*toast\.className = `toast \$\{type\}`;\s*toast\.innerText = message;\s*container\.appendChild\(toast\);\s*\/\/ Trigger animation\s*setTimeout\(\(\) => toast\.classList\.add\('show'\), 10\);\s*\/\/ Remove after 3 seconds\s*setTimeout\(\(\) => \{\s*toast\.classList\.remove\('show'\);\s*setTimeout\(\(\) => toast\.remove\(\), 300\);\s*\}, 3000\);\s*\};\s*/;

if (toastRegex.test(content)) {
    content = content.replace(toastRegex, '');
    fs.writeFileSync(targetPath, content);
    console.log('Successfully removed duplicate showToast from admin.js');
} else {
    console.log('Could not find showToast in admin.js');
}
