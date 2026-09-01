const fs = require('fs');

// 1. Modify components.js
const compPath = 'd:/ecommerce_git/client/js/components.js';
let compContent = fs.readFileSync(compPath, 'utf8');

// The image tag and badges
const imgRegex = /<img src="\$\{imgSrc\}" alt="\$\{escapeHTML\(product\.name\)\}" loading="lazy" onerror="this\.src='\.\/images\/hero-collection\.png'">\s*\$\{product\.is_new \? '<span class="product-badge new">Mới<\/span>' : ''\}/;

const newImgStr = `<img src="\${imgSrc}" alt="\${escapeHTML(product.name)}" loading="lazy" onerror="this.src='./images/hero-collection.png'">
        \${product.model_3d ? \`<button class="view-3d-btn" type="button" aria-label="Xem 3D" onclick="event.stopPropagation(); if(window.Product3DPreview) window.Product3DPreview.openModal(this.closest('.product-card'))"><i class="fas fa-cube"></i> Xem 3D</button>\` : ''}
        \${product.is_new ? '<span class="product-badge new">Mới</span>' : ''}`;

compContent = compContent.replace(imgRegex, newImgStr);
fs.writeFileSync(compPath, compContent);
console.log('Patched components.js');

// 2. Modify 3d-preview.js
const previewPath = 'd:/ecommerce_git/client/js/3d-preview.js';
let previewContent = fs.readFileSync(previewPath, 'utf8');

// Remove mouseover and mouseout events in init()
const initRegex = /function init\(\) \{[\s\S]*?return \{ init \};/m;
const newInitStr = `function init() {
    // Only insert CSS once
    if (!document.getElementById('view-3d-btn-styles')) {
        const style = document.createElement('style');
        style.id = 'view-3d-btn-styles';
        style.innerHTML = \`
            .product-card .product-image {
                position: relative;
            }
            .product-card .view-3d-btn {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                color: #fff;
                padding: 10px 18px;
                border-radius: 30px;
                font-weight: 600;
                font-size: 0.9rem;
                opacity: 0;
                transition: all 0.3s ease;
                cursor: pointer;
                z-index: 10;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                pointer-events: none; /* Ignore pointer events when invisible */
            }
            .product-card:hover .view-3d-btn {
                opacity: 1;
                pointer-events: auto; /* Enable when visible */
            }
            .product-card .view-3d-btn:hover {
                background: rgba(255, 255, 255, 0.35);
                transform: translate(-50%, -50%) scale(1.05);
            }
        \`;
        document.head.appendChild(style);
    }
  }

  return { init, openModal };`;

previewContent = previewContent.replace(initRegex, newInitStr);
fs.writeFileSync(previewPath, previewContent);
console.log('Patched 3d-preview.js');
