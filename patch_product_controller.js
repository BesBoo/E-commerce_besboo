const fs = require('fs');
const targetPath = 'd:/ecommerce_git/server/controllers/productController.js';
let content = fs.readFileSync(targetPath, 'utf8');

const targetContent = `            if (category) {
                whereConditions.push(\`c.name = $\${paramIndex++}\`);
                params.push(category);
            }`;

const replacementContent = `            if (category) {
                whereConditions.push(\`(c.name = $\${paramIndex} OR c.category_id::text = $\${paramIndex})\`);
                params.push(category.toString());
                paramIndex++;
            }`;

if (content.includes(targetContent)) {
    content = content.replace(targetContent, replacementContent);
    fs.writeFileSync(targetPath, content);
    console.log('Successfully patched productController.js');
} else {
    // try regex fallback
    const regex = /if\s*\(category\)\s*\{\s*whereConditions\.push\(`c\.name\s*=\s*\$\$\{paramIndex\+\+\}`\);\s*params\.push\(category\);\s*\}/;
    if (regex.test(content)) {
        content = content.replace(regex, replacementContent);
        fs.writeFileSync(targetPath, content);
        console.log('Successfully patched productController.js via regex');
    } else {
        console.log('Target content not found in productController.js');
    }
}
