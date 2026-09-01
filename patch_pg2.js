const fs = require('fs');

const targetPath = 'd:/ecommerce_git/server/controllers/productController.js';
let content = fs.readFileSync(targetPath, 'utf8');

content = content.replace(
    'whereConditions.push(`c.name = ${paramIndex++}`);',
    'whereConditions.push(`c.name = $${paramIndex++}`);'
);

content = content.replace(
    'whereConditions.push(`(p.name ILIKE ${paramIndex} OR p.brand ILIKE ${paramIndex})`);',
    'whereConditions.push(`(p.name ILIKE $${paramIndex} OR p.brand ILIKE $${paramIndex})`);'
);

content = content.replace(
    'LIMIT ${paramIndex++} OFFSET ${paramIndex++}',
    'LIMIT $${paramIndex++} OFFSET $${paramIndex++}'
);

fs.writeFileSync(targetPath, content);
console.log('Fixed pg params for real');
