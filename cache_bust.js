const fs = require('fs');
const targetPath = 'd:/ecommerce_git/client/admin.html';
let content = fs.readFileSync(targetPath, 'utf8');

content = content.replace('<script src="./js/api.js?v=2"></script>', '<script src="./js/api.js?v=3"></script>');
content = content.replace('<script src="./js/admin.js?v=2"></script>', '<script src="./js/admin.js?v=3"></script>');

fs.writeFileSync(targetPath, content);
console.log('Successfully bumped cache versions to v=3');
