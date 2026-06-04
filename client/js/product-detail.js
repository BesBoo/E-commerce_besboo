// Product detail page controller
(function () {
    let currentProduct = null;
    let selectedOptions = { color: null, size: null };
    let quantity = 1;
    let productImages = [];
    let currentImageIndex = 0;

    function parseList(value) {
        if (window.BesBooData?.parseList) {
            return BesBooData.parseList(value);
        }
        if (Array.isArray(value)) return value;
        if (!value) return [];
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return String(value).split(',').map((item) => item.trim()).filter(Boolean);
        }
    }

    function normalizeProduct(product) {
        const productId = product.product_id ?? product.id;
        return {
            ...product,
            product_id: productId,
            category_name: product.category_name || 'Sản phẩm',
            discount_percent: Number(product.discount_percent || 0),
            avg_rating: Number(product.avg_rating || 0),
            review_count: Number(product.review_count || 0),
            stock: Number(product.stock ?? 0),
            price: Number(product.price || 0)
        };
    }

    function extractProduct(response) {
        if (!response || response.success === false) return null;
        if (response.product) return response.product;
        if (response.product_id != null || response.id != null) return response;
        return null;
    }

    document.addEventListener('DOMContentLoaded', async () => {
        Components.initLayout({ activePage: 'products', subNavTitle: 'Chi tiết sản phẩm' });

        try {
            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id');

            if (!productId) {
                showError('Không tìm thấy sản phẩm. Vui lòng chọn sản phẩm từ danh sách.');
                return;
            }

            await loadProduct(productId);
            setupEventListeners();
        } catch (error) {
            console.error('Error initializing product detail page:', error);
            showError('Có lỗi xảy ra khi tải trang');
        }
    });

    async function loadProduct(productId) {
        try {
            const response = await API.products.getProduct(productId);
            const rawProduct = extractProduct(response);

            if (!rawProduct) {
                throw new Error('Sản phẩm không tồn tại');
            }

            currentProduct = normalizeProduct(rawProduct);
            renderProduct(currentProduct);

            if (currentProduct.category_id) {
                await loadRelatedProducts(currentProduct.category_id);
            }

            document.getElementById('loadingState').style.display = 'none';
            document.getElementById('productContent').style.display = 'block';
        } catch (error) {
            console.error('Error loading product:', error);
            showError(error.message || 'Không thể tải thông tin sản phẩm');
        }
    }

    function renderProduct(product) {
        document.title = `${product.name} - BesBoo`;
        document.getElementById('productBreadcrumb').textContent = product.name;
        document.getElementById('productCategory').textContent = product.category_name;
        document.getElementById('productTitle').textContent = product.name;
        document.getElementById('productDescription').innerHTML = product.description || '';

        renderPrice(product);
        renderRating(product);
        renderImages(product);
        renderOptions(product);
        renderStockInfo(product);
        renderTabsContent(product);
    }

    function renderPrice(product) {
        const priceContainer = document.getElementById('productPrice');
        if (product.discount_percent > 0) {
            const discountedPrice = product.price * (1 - product.discount_percent / 100);
            priceContainer.innerHTML = `
                <span class="current-price">${Utils.formatCurrency(discountedPrice)}</span>
                <span class="original-price">${Utils.formatCurrency(product.price)}</span>
                <span class="discount-percent">-${product.discount_percent}%</span>
            `;
        } else {
            priceContainer.innerHTML = `<span class="current-price">${Utils.formatCurrency(product.price)}</span>`;
        }
    }

    function renderRating(product) {
        const ratingContainer = document.getElementById('productRating');
        const avgRating = product.avg_rating;
        const reviewCount = product.review_count;

        document.getElementById('ratingStars').innerHTML = generateStars(avgRating);
        document.getElementById('ratingText').textContent = `${avgRating.toFixed(1)} (${reviewCount} đánh giá)`;
        ratingContainer.style.display = reviewCount > 0 ? '' : 'none';
    }

    function renderImages(product) {
        productImages = [];
        if (product.image_url) productImages.push(product.image_url);
        productImages.push(...parseList(product.images).filter((url) => url && !productImages.includes(url)));

        if (productImages.length === 0) {
            productImages.push('./images/hero-collection.png');
        }

        const mainImg = document.getElementById('mainImageImg');
        mainImg.src = productImages[0];
        mainImg.alt = product.name;
        mainImg.onerror = function onImageError() {
            this.onerror = null;
            this.src = './images/hero-collection.png';
        };

        renderBadges(product);
        renderThumbnails();
    }

    function renderBadges(product) {
        const badges = [];
        if (product.is_new) badges.push('<span class="image-badge new">Mới</span>');
        if (product.is_featured) badges.push('<span class="image-badge featured">Nổi bật</span>');
        if (product.discount_percent > 0) {
            badges.push(`<span class="image-badge sale">-${product.discount_percent}%</span>`);
        }
        document.getElementById('imageBadges').innerHTML = badges.join('');
    }

    function renderThumbnails() {
        const thumbnailsContainer = document.getElementById('thumbnailImages');
        if (productImages.length <= 1) {
            thumbnailsContainer.style.display = 'none';
            return;
        }

        thumbnailsContainer.style.display = '';
        thumbnailsContainer.innerHTML = productImages.map((img, index) => `
            <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
                <img src="${img}" alt="Hình ${index + 1}" class="${index === 0 ? 'active' : ''}" loading="lazy"
                     onerror="this.src='./images/hero-collection.png'">
            </div>
        `).join('');
    }

    function renderOptions(product) {
        const optionsContainer = document.getElementById('productOptions');
        const colors = parseList(product.colors);
        const sizes = parseList(product.sizes);
        let optionsHTML = '';

        if (colors.length) {
            optionsHTML += `
                <div class="option-group">
                    <label class="option-label">Màu sắc:</label>
                    <div class="option-buttons">
                        ${colors.map((color) => `
                            <button type="button" class="option-btn color-btn" data-color="${color}">${color}</button>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        if (sizes.length) {
            optionsHTML += `
                <div class="option-group">
                    <label class="option-label">Kích thước:</label>
                    <div class="option-buttons">
                        ${sizes.map((size) => `
                            <button type="button" class="option-btn size-btn" data-size="${size}">${size}</button>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        optionsContainer.innerHTML = optionsHTML;
    }

    function renderStockInfo(product) {
        const stockInfo = document.getElementById('stockInfo');
        const stock = product.stock;
        const addBtn = document.getElementById('addToCartBtn');
        const buyBtn = document.getElementById('buyNowBtn');
        const qtyInput = document.getElementById('quantityInput');

        if (stock <= 0) {
            stockInfo.textContent = 'Hết hàng';
            stockInfo.className = 'stock-info out-of-stock';
            addBtn.disabled = true;
            buyBtn.disabled = true;
            qtyInput.max = 1;
        } else if (stock < 10) {
            stockInfo.textContent = `Chỉ còn ${stock} sản phẩm`;
            stockInfo.className = 'stock-info low-stock';
            addBtn.disabled = false;
            buyBtn.disabled = false;
            qtyInput.max = stock;
        } else {
            stockInfo.textContent = `Còn ${stock} sản phẩm`;
            stockInfo.className = 'stock-info';
            addBtn.disabled = false;
            buyBtn.disabled = false;
            qtyInput.max = Math.min(stock, 99);
        }
    }

    function renderTabsContent(product) {
        document.getElementById('descriptionContent').innerHTML =
            product.description || 'Chưa có mô tả chi tiết.';
        renderSpecifications(product);
        renderReviews(product);
    }

    function renderSpecifications(product) {
        const specs = [
            ['Tên sản phẩm', product.name],
            ['Thương hiệu', product.brand || 'Chưa cập nhật'],
            ['Danh mục', product.category_name],
            ['Giá', Utils.formatCurrency(product.price)],
            ['Tồn kho', product.stock]
        ];

        const colors = parseList(product.colors);
        const sizes = parseList(product.sizes);
        if (colors.length) specs.push(['Màu sắc', colors.join(', ')]);
        if (sizes.length) specs.push(['Kích thước', sizes.join(', ')]);

        document.getElementById('specificationsTable').innerHTML = specs.map(([label, value]) => `
            <tr><th>${label}</th><td>${value}</td></tr>
        `).join('');
    }

    function renderReviews(product) {
        const reviewCount = product.review_count;
        const avgRating = product.avg_rating;

        document.getElementById('reviewCount').textContent = reviewCount;
        document.getElementById('overallRating').textContent = avgRating.toFixed(1);
        document.getElementById('overallStars').innerHTML = generateStars(avgRating);
        document.getElementById('overallCount').textContent = `${reviewCount} đánh giá`;

        renderRatingBreakdown();

        const reviews = product.reviews || [];
        if (reviews.length) {
            renderReviewsList(reviews);
        } else {
            document.getElementById('reviewsList').innerHTML = `
                <div class="no-reviews"><p>Chưa có đánh giá nào cho sản phẩm này.</p></div>
            `;
        }
    }

    function renderRatingBreakdown() {
        const breakdown = [
            { stars: 5, count: 12, percentage: 60 },
            { stars: 4, count: 5, percentage: 25 },
            { stars: 3, count: 2, percentage: 10 },
            { stars: 2, count: 1, percentage: 5 },
            { stars: 1, count: 0, percentage: 0 }
        ];

        document.getElementById('ratingBreakdown').innerHTML = breakdown.map((item) => `
            <div class="rating-bar">
                <span class="rating-bar-label">${item.stars} sao</span>
                <div class="rating-bar-fill">
                    <div class="rating-bar-value" style="width: ${item.percentage}%"></div>
                </div>
                <span class="rating-bar-count">${item.count}</span>
            </div>
        `).join('');
    }

    function renderReviewsList(reviews) {
        document.getElementById('reviewsList').innerHTML = reviews.map((review) => `
            <div class="review-item">
                <div class="review-header">
                    <div class="reviewer-info">
                        <div class="reviewer-avatar">${getInitials(review.full_name || review.username)}</div>
                        <div>
                            <div class="reviewer-name">${review.full_name || review.username}</div>
                            <div class="review-date">${Utils.formatDate(review.created_at)}</div>
                        </div>
                    </div>
                </div>
                <div class="review-rating">${generateStars(review.rating)}</div>
                <div class="review-content">${review.comment || 'Không có bình luận'}</div>
            </div>
        `).join('');
    }

    async function loadRelatedProducts(categoryId) {
        try {
            const response = await API.products.getProducts({
                category: categoryId,
                limit: 8
            });
            const allProducts = response.products || [];
            const relatedProducts = allProducts.filter(
                (p) => String(p.product_id) !== String(currentProduct.product_id)
            );

            if (!relatedProducts.length) {
                document.getElementById('relatedProducts').style.display = 'none';
                return;
            }

            document.getElementById('relatedGrid').innerHTML = relatedProducts
                .slice(0, 4)
                .map((product) => Components.renderProductCard(product, { showAddToCart: true }))
                .join('');
        } catch (error) {
            console.error('Error loading related products:', error);
            document.getElementById('relatedProducts').style.display = 'none';
        }
    }

    function setupEventListeners() {
        document.addEventListener('click', (e) => {
            const thumbnail = e.target.closest('.thumbnail');
            if (thumbnail) {
                changeMainImage(parseInt(thumbnail.dataset.index, 10));
            }
        });

        document.getElementById('zoomBtn').addEventListener('click', () => {
            const modal = document.getElementById('imageModal');
            document.getElementById('modalImage').src = productImages[currentImageIndex];
            modal.style.display = 'flex';
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            document.getElementById('imageModal').style.display = 'none';
        });

        document.getElementById('imageModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                document.getElementById('imageModal').style.display = 'none';
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('color-btn')) {
                selectColor(e.target.dataset.color, e.target);
            } else if (e.target.classList.contains('size-btn')) {
                selectSize(e.target.dataset.size, e.target);
            }
        });

        document.getElementById('decreaseBtn').addEventListener('click', () => {
            const input = document.getElementById('quantityInput');
            if (input.value > 1) {
                input.value = parseInt(input.value, 10) - 1;
                quantity = parseInt(input.value, 10);
            }
        });

        document.getElementById('increaseBtn').addEventListener('click', () => {
            const input = document.getElementById('quantityInput');
            const max = parseInt(input.max, 10) || 99;
            if (input.value < max) {
                input.value = parseInt(input.value, 10) + 1;
                quantity = parseInt(input.value, 10);
            }
        });

        document.getElementById('quantityInput').addEventListener('change', (e) => {
            const max = parseInt(e.target.max, 10) || 99;
            let value = parseInt(e.target.value, 10);
            if (Number.isNaN(value) || value < 1) value = 1;
            else if (value > max) value = max;
            e.target.value = value;
            quantity = value;
        });

        document.getElementById('addToCartBtn').addEventListener('click', addToCart);
        document.getElementById('buyNowBtn').addEventListener('click', buyNow);
        document.getElementById('favoriteBtn').addEventListener('click', toggleFavorite);

        document.querySelectorAll('.tab-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => switchTab(e.currentTarget.dataset.tab));
        });

        document.getElementById('writeReviewBtn').addEventListener('click', () => {
            if (!Utils.getUser()) {
                Utils.showToast('Vui lòng đăng nhập để viết đánh giá', 'error');
                return;
            }
            Utils.showToast('Tính năng viết đánh giá sẽ được cập nhật sớm', 'info');
        });
    }

    function changeMainImage(index) {
        if (index < 0 || index >= productImages.length) return;
        currentImageIndex = index;
        document.getElementById('mainImageImg').src = productImages[index];
        document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
            const img = thumb.querySelector('img');
            if (img) img.classList.toggle('active', i === index);
        });
    }

    function selectColor(color, button) {
        selectedOptions.color = color;
        document.querySelectorAll('.color-btn').forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');
    }

    function selectSize(size, button) {
        selectedOptions.size = size;
        document.querySelectorAll('.size-btn').forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');
    }

    function switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        document.querySelectorAll('.tab-content').forEach((content) => content.classList.remove('active'));
        document.getElementById(`${tabName}Tab`)?.classList.add('active');
    }

    async function addToCart() {
        if (!currentProduct || currentProduct.stock <= 0) {
            Utils.showToast('Sản phẩm đã hết hàng', 'error');
            return;
        }
        await Components.addToCart(currentProduct, {
            quantity,
            color: selectedOptions.color,
            size: selectedOptions.size
        });
    }

    async function buyNow() {
        if (!currentProduct || currentProduct.stock <= 0) {
            Utils.showToast('Sản phẩm đã hết hàng', 'error');
            return;
        }
        const added = await Components.addToCart(currentProduct, {
            quantity,
            color: selectedOptions.color,
            size: selectedOptions.size
        });
        if (added !== false) {
            window.location.href = './cart.html';
        }
    }

    async function toggleFavorite() {
        if (!Utils.getUser()) {
            Utils.showToast('Vui lòng đăng nhập để thêm sản phẩm yêu thích', 'error');
            return;
        }
        try {
            const response = await API.favorites.toggleFavorite(currentProduct.product_id);
            const btn = document.getElementById('favoriteBtn');
            const icon = btn.querySelector('i');
            if (response.is_favorite) {
                icon.className = 'fas fa-heart';
                btn.classList.add('active');
            } else {
                icon.className = 'far fa-heart';
                btn.classList.remove('active');
            }
            Utils.showToast(response.message);
        } catch (error) {
            Utils.showToast(error.message, 'error');
        }
    }

    function showError(message) {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('errorState').style.display = 'block';
        const errorMessage = document.querySelector('#errorState p');
        if (errorMessage) errorMessage.textContent = message;
    }

    function generateStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i += 1) {
            if (i <= rating) stars += '<i class="fas fa-star"></i>';
            else if (i - 0.5 <= rating) stars += '<i class="fas fa-star-half-alt"></i>';
            else stars += '<i class="far fa-star"></i>';
        }
        return stars;
    }

    function getInitials(name) {
        if (!name) return '?';
        const words = name.trim().split(' ');
        if (words.length >= 2) {
            return (words[0][0] + words[words.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    window.viewProduct = (productId) => {
        window.location.href = `./product-detail.html?id=${productId}`;
    };
})();
