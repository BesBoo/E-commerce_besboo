// client/js/components.js — Shared UI component generators (Apple-inspired)
// Class names aligned with style.css

const Components = (() => {
  /* ─── Global Nav (black bar) ─── */
  function renderGlobalNav(opts = {}) {
    const { activePage = '' } = opts;
    const user = Utils.getUser();
    const links = [
      { href: './index.html', label: 'Trang chủ', key: 'home' },
      { href: './product.html', label: 'Sản phẩm', key: 'products' },
      { href: './categories.html', label: 'Danh mục', key: 'categories' },
      { href: './contact.html', label: 'Liên hệ', key: 'contact' },
    ];

    return `
    <header class="global-nav" id="globalNav">
      <div class="global-nav__inner container">
        <a href="./index.html" class="global-nav__logo">BesBoo</a>
        <nav class="global-nav__links" id="navLinks">
          ${links.map(l =>
            `<a href="${l.href}" class="global-nav__link${activePage === l.key ? ' active' : ''}"${activePage === l.key ? ' aria-current="page"' : ''}>${l.label}</a>`
          ).join('')}
        </nav>
        <div class="global-nav__actions">
          <button class="global-nav__icon" id="searchToggle" aria-label="Tìm kiếm"><i class="fas fa-search"></i></button>
          ${user
            ? `<div class="user-menu">
                <button class="global-nav__icon user-btn" id="userBtn" aria-label="Tài khoản"><i class="fas fa-user"></i></button>
                <div class="dropdown" id="userDropdown">
                  <a href="#" onclick="event.preventDefault()" style="font-weight:600;pointer-events:none">${user.username}</a>
                  <a href="./orders.html"><i class="fas fa-shopping-bag"></i> Đơn hàng</a>
                  ${user.role === 'admin' ? '<a href="./admin.html"><i class="fas fa-cog"></i> Quản trị</a>' : ''}
                  <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Đăng xuất</a>
                </div>
              </div>`
            : `<a href="./login.html" class="global-nav__icon" aria-label="Đăng nhập"><i class="fas fa-user"></i></a>`
          }
          <a href="./cart.html" class="global-nav__icon cart-icon" aria-label="Giỏ hàng">
            <i class="fas fa-shopping-bag"></i>
            <span class="cart-count" id="cartCount">0</span>
          </a>
          <button class="global-nav__icon mobile-menu-btn" id="hamburgerBtn" aria-label="Menu"><i class="fas fa-bars"></i></button>
        </div>
      </div>
      <!-- Search overlay -->
      <div class="search-overlay" id="searchOverlay">
        <div class="container">
          <div class="search-box">
            <input type="text" class="search-input" id="searchInput" placeholder="Tìm kiếm sản phẩm..." autocomplete="off">
            <button class="search-btn" id="searchClose" aria-label="Đóng"><i class="fas fa-times"></i></button>
          </div>
        </div>
      </div>
    </header>`;
  }

  /* ─── Sub-Nav (frosted bar) ─── */
  function renderSubNav(opts = {}) {
    const { subNavTitle = 'BesBoo' } = opts;
    return `
    <div class="sub-nav" id="subNav">
      <div class="container sub-nav__inner">
        <span class="sub-nav__title type-tagline">${subNavTitle}</span>
        <div class="sub-nav__links">
          <a href="./product.html" class="btn btn-primary sub-nav__cta">Mua ngay</a>
        </div>
      </div>
    </div>`;
  }

  /* ─── Footer ─── */
  function renderFooter() {
    return `
    <footer>
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>Mua sắm</h3>
            <ul>
              <li><a href="./product.html">Tất cả sản phẩm</a></li>
              <li><a href="./categories.html">Danh mục</a></li>
              <li><a href="./product.html?featured=true">Nổi bật</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h3>Tài khoản</h3>
            <ul>
              <li><a href="./login.html">Đăng nhập</a></li>
              <li><a href="./register.html">Đăng ký</a></li>
              <li><a href="./orders.html">Đơn hàng</a></li>
              <li><a href="./cart.html">Giỏ hàng</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h3>Hỗ trợ</h3>
            <ul>
              <li><a href="./contact.html">Liên hệ</a></li>
              <li><a href="#">Chính sách đổi trả</a></li>
              <li><a href="#">Vận chuyển</a></li>
              <li><a href="#">Câu hỏi thường gặp</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h3>Liên hệ</h3>
            <ul>
              <li>123 Đường ABC, TP.HCM</li>
              <li>1900-xxxx</li>
              <li>besboo@gmail.com</li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; ${new Date().getFullYear()} BesBoo. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>`;
  }

  /* ─── Newsletter ─── */
  function renderNewsletter() {
    return `
    <section class="newsletter">
      <h2 class="newsletter__title">Nhận ưu đãi sớm nhất</h2>
      <p class="newsletter__desc">Đăng ký để không bỏ lỡ bộ sưu tập mới và khuyến mãi độc quyền.</p>
      <form class="newsletter__form" onsubmit="event.preventDefault(); Utils.showToast('Đăng ký thành công!');">
        <input type="email" class="newsletter__input" placeholder="Email của bạn" required>
        <button type="submit" class="btn btn-primary">Đăng ký</button>
      </form>
    </section>`;
  }

  function escapeHTML(value = '') {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderStars(rating = 0) {
    let stars = '';
    for (let index = 1; index <= 5; index += 1) {
      if (index <= rating) {
        stars += '<i class="fas fa-star"></i>';
      } else if (index - 0.5 <= rating) {
        stars += '<i class="fas fa-star-half-alt"></i>';
      } else {
        stars += '<i class="far fa-star"></i>';
      }
    }
    return stars;
  }

  /* ─── Product Card (utility-card) ─── */
  function renderProductCard(product, options = {}) {
    const { listView = false, showAddToCart = true, showQuickView = true } = options;
    const discount = product.discount_percent > 0;
    const finalPrice = discount
      ? product.price * (1 - product.discount_percent / 100)
      : product.price;
    const imgSrc = product.image_url || './images/hero-collection.png';
    const isOutOfStock = Number(product.stock || 0) <= 0;
    const cardClass = `product-card${listView ? ' list-view' : ''}`;
    const rating = Number(product.avg_rating || 0);
    const reviewCount = Number(product.review_count || 0);

    return `
    <article class="${cardClass}" data-product-id="${product.product_id}" onclick="location.href='./product-detail.html?id=${product.product_id}'">
      <div class="product-image">
        <img src="${imgSrc}" alt="${escapeHTML(product.name)}" loading="lazy" onerror="this.src='./images/hero-collection.png'">
        ${product.is_new ? '<span class="product-badge new">Mới</span>' : ''}
        ${product.is_featured ? '<span class="product-badge featured">Nổi bật</span>' : ''}
        ${discount ? `<span class="product-badge sale">-${product.discount_percent}%</span>` : ''}
        <button class="favorite-btn" type="button" aria-label="Yêu thích" onclick="event.stopPropagation(); Components.toggleFavorite(${product.product_id}, this)">
          <i class="far fa-heart"></i>
        </button>
      </div>
      <div class="product-info">
        <div class="product-category">${escapeHTML(product.category_name || 'Sản phẩm')}</div>
        <h3>${escapeHTML(product.name)}</h3>
        ${reviewCount ? `
          <div class="product-rating">
            <span class="rating-stars">${renderStars(rating)}</span>
            <span class="rating-count">${rating.toFixed(1)} (${reviewCount})</span>
          </div>
        ` : ''}
        <div class="product-price">
          <span class="current-price">${Utils.formatCurrency(finalPrice)}</span>
          ${discount ? `<span class="original-price">${Utils.formatCurrency(product.price)}</span>` : ''}
        </div>
        ${isOutOfStock ? '<p class="stock-text out-of-stock">Hết hàng</p>' : `<p class="stock-text">Còn ${product.stock || 0} sản phẩm</p>`}
        <div class="product-actions">
          ${showAddToCart ? `
            <button class="add-cart-btn" type="button" ${isOutOfStock ? 'disabled' : ''} onclick="event.stopPropagation(); Components.addToCart(${product.product_id})">
              <i class="fas fa-shopping-cart"></i>
              Thêm giỏ
            </button>
          ` : ''}
          ${showQuickView ? `
            <a href="./product-detail.html?id=${product.product_id}" class="detail-btn" onclick="event.stopPropagation()">
              Chi tiết
              <i class="fas fa-chevron-right"></i>
            </a>
          ` : ''}
        </div>
      </div>
    </article>`;
  }

  async function addToCart(productOrId, options = {}) {
    try {
      let product = typeof productOrId === 'object' ? productOrId : null;

      if (!product) {
        const response = await API.products.getProduct(productOrId);
        product = response.product || response;
      }

      if (!product || !product.product_id) {
        throw new Error('Không tìm thấy sản phẩm');
      }

      return await API.cart.addToCart({
        ...product,
        product_id: product.product_id,
        quantity: options.quantity || 1,
        color: options.color || null,
        size: options.size || null
      });
    } catch (error) {
      console.error('Component add to cart error:', error);
      Utils.showToast(error.message || 'Không thể thêm sản phẩm vào giỏ hàng', 'error');
      return false;
    }
  }

  async function toggleFavorite(productId, button) {
    if (!Utils.getUser()) {
      Utils.showToast('Vui lòng đăng nhập để lưu sản phẩm yêu thích', 'error');
      return false;
    }

    try {
      const response = await API.favorites.toggleFavorite(productId);
      const icon = button?.querySelector('i');

      button?.classList.toggle('active', response.is_favorite);
      if (icon) icon.className = response.is_favorite ? 'fas fa-heart' : 'far fa-heart';
      Utils.showToast(response.message || 'Đã cập nhật yêu thích');
      return response;
    } catch (error) {
      Utils.showToast(error.message || 'Không thể cập nhật yêu thích', 'error');
      return false;
    }
  }

  /* ─── Category Card ─── */
  function renderCategoryCard(cat) {
    const imgSrc = cat.image_url || './image/ao-nike.png';
    return `
    <div class="category-card" onclick="location.href='./product.html?category=${cat.category_id}'">
      <div class="category-image">
        <img src="${imgSrc}" alt="${cat.name}" loading="lazy">
      </div>
      <div class="category-info">
        <h3>${cat.name}</h3>
        <a class="text-link">Xem ${cat.product_count || ''} sản phẩm <i class="fas fa-chevron-right" style="font-size:10px"></i></a>
      </div>
    </div>`;
  }

  /* ─── Promotion Card ─── */
  function renderPromotionCard(promo) {
    return `
    <div class="promotion-card">
      <div class="promo-icon"><i class="${promo.icon || 'fas fa-tag'}"></i></div>
      <div class="promo-content">
        <h4>${promo.title || promo.name || 'Khuyến mãi'}</h4>
        <p>${promo.description || promo.short_description || ''}</p>
        ${promo.discount_percent ? `<small>Giảm ${promo.discount_percent}%</small>` : ''}
      </div>
    </div>`;
  }

  /* ─── Init Layout (mount header + footer + events) ─── */
  function initLayout(opts = {}) {
    // Mount header
    const headerEl = document.getElementById('site-header');
    if (headerEl) {
      headerEl.innerHTML = renderGlobalNav(opts) + renderSubNav(opts);
    }

    // Mount footer
    const footerEl = document.getElementById('site-footer');
    if (footerEl) {
      footerEl.innerHTML = renderFooter();
    }

    // Init auth UI
    Utils.initializeAuth();

    // Update cart count
    API.cart.updateCartCount();

    // Bind interactive events
    _bindHeaderEvents();
  }

  /* ─── Mount Newsletter ─── */
  function mountNewsletter(selector) {
    const el = document.querySelector(selector);
    if (el) el.innerHTML = renderNewsletter();
  }

  /* ─── Private: header event bindings ─── */
  function _bindHeaderEvents() {
    // Search toggle
    const searchToggle = document.getElementById('searchToggle');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchClose = document.getElementById('searchClose');
    const searchInput = document.getElementById('searchInput');

    if (searchToggle && searchOverlay) {
      searchToggle.addEventListener('click', () => {
        searchOverlay.classList.add('open');
        searchInput?.focus();
      });
      searchClose?.addEventListener('click', () => searchOverlay.classList.remove('open'));
      searchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const q = searchInput.value.trim();
          if (q) window.location.href = `./product.html?search=${encodeURIComponent(q)}`;
        }
      });
      // Close on Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') searchOverlay.classList.remove('open');
      });
    }

    // User dropdown
    const userBtn = document.getElementById('userBtn');
    const userDropdown = document.getElementById('userDropdown');
    if (userBtn && userDropdown) {
      userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
      });
      document.addEventListener('click', () => userDropdown.classList.remove('show'));
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        API.auth.logout();
      });
    }

    // Hamburger menu
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');
    if (hamburgerBtn && navLinks) {
      hamburgerBtn.addEventListener('click', () => navLinks.classList.toggle('is-open'));
    }

    // Sub-nav appear on scroll
    const subNav = document.getElementById('subNav');
    if (subNav) {
      window.addEventListener('scroll', () => {
        subNav.classList.toggle('visible', window.scrollY > 120);
      }, { passive: true });
    }
  }

  // Public API
  return {
    initLayout,
    mountNewsletter,
    renderProductCard,
    renderCategoryCard,
    renderPromotionCard,
    addToCart,
    toggleFavorite,
    renderGlobalNav,
    renderSubNav,
    renderFooter,
    renderNewsletter,
  };
})();
