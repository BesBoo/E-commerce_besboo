const fs = require('fs');
const targetPath = 'd:/ecommerce_git/client/js/admin.js';

let content = fs.readFileSync(targetPath, 'utf8');
content = content.replace(/\r\n/g, '\n');

// Remove API_BASE_URL
content = content.replace("const API_BASE_URL = '/api';\n", "");

// Remove formatCurrency
const formatCurrencyRegex = /\/\/ Format currency\nconst formatCurrency = \(amount\) => \{\n    return new Intl\.NumberFormat\('vi-VN', \{ style: 'currency', currency: 'VND' \}\)\.format\(amount\);\n\};\n\n/g;
content = content.replace(formatCurrencyRegex, "");

// Remove formatDate
const formatDateRegex = /\/\/ Format date\nconst formatDate = \(dateString\) => \{\n    if \(\!dateString\) return '-';\n    const d = new Date\(dateString\);\n    return d\.toLocaleString\('vi-VN'\);\n\};\n\n/g;
content = content.replace(formatDateRegex, "");

// Remove getToken
const getTokenRegex = /\/\/ Get Token\nconst getToken = \(\) => \{\n    return localStorage\.getItem\('token'\);\n\};\n\n/g;
content = content.replace(getTokenRegex, "");

fs.writeFileSync(targetPath, content);
console.log('Successfully removed duplicate declarations from admin.js');
