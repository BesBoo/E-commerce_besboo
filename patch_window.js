const fs = require('fs');

const path = 'd:/ecommerce_git/client/js/3d-preview.js';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('window.Product3DPreview = Product3DPreview;')) {
    content += '\nwindow.Product3DPreview = Product3DPreview;\n';
    fs.writeFileSync(path, content);
    console.log('Successfully assigned Product3DPreview to window');
} else {
    console.log('Already assigned');
}
