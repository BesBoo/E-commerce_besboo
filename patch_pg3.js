const fs = require('fs');

const targetPath = 'd:/ecommerce_git/server/controllers/productController.js';
let content = fs.readFileSync(targetPath, 'utf8');

// Use simple string replacement on the exact problematic fragments
content = content.split('c.name = ${paramIndex++}').join('c.name = $${paramIndex++}');
content = content.split('p.name ILIKE ${paramIndex} OR p.brand ILIKE ${paramIndex}').join('p.name ILIKE $${paramIndex} OR p.brand ILIKE $${paramIndex}');
content = content.split('LIMIT ${paramIndex++} OFFSET ${paramIndex++}').join('LIMIT $${paramIndex++} OFFSET $${paramIndex++}');

fs.writeFileSync(targetPath, content);
console.log('Fixed pg params for real 3');
