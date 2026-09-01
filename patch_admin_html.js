const fs = require('fs');

const targetPath = 'd:/ecommerce_git/client/admin.html';
let content = fs.readFileSync(targetPath, 'utf8');

content = content.replace('<script src="/js/admin.js"></script>', '<script src="./js/api.js"></script>\n    <script src="./js/admin.js"></script>');

fs.writeFileSync(targetPath, content);
console.log('Successfully added api.js to admin.html');
