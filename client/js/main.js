// main.js

// Main JavaScript file for common functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize common functionality
    initializeApp();
});

// Initialize application
function initializeApp() {
    // Setup global error handling
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);
    
    // Setup common event listeners
    setupCommonEventListeners();
    
    // Check authentication status
    checkAuthStatus();
    
    // Setup page-specific functionality
    setupPageSpecificFunctions();
}

// Global error handler
function handleGlobalError(event) {
    console.error('Global error:', event.error);
    Utils.showToast('Đã xảy ra lỗi không mong muốn', 'error');
}

// Promise rejection handler
function handlePromiseRejection(event) {
    console.error('Unhandled promise rejection:', event.reason);
    Utils.showToast('Đã xảy ra lỗi trong quá trình xử lý', 'error');
}

// Setup common event listeners
function setupCommonEventListeners() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('show');
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Back to top button
    const backToTopBtn = createBackToTopButton();
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });

    // Form validation
    setupFormValidation();
    
    // Image lazy loading
    setupLazyLoading();
}

// Create back to top button
function createBackToTopButton() {
    const button = document.createElement('button');
    button.innerHTML = '<i class="fas fa-chevron-up"></i>';
    button.className = 'back-to-top';
    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: #e74c3c;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        z-index: 1000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        transition: all 0.3s;
    `;
    
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    button.addEventListener('mouseenter', () => {
        button.style.background = '#c0392b';
        button.style.transform = 'scale(1.1)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.background = '#e74c3c';
        button.style.transform = 'scale(1)';
    });
    
    document.body.appendChild(button);
    return button;
}

// Setup form validation
function setupFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearErrors(input));
        });
        
        form.addEventListener('submit', (e) => {
            if (!validateForm(form)) {
                e.preventDefault();
            }
        });
    });
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');
    let isValid = true;
    let errorMessage = '';

    // Clear previous errors
    clearErrors(field);

    // Required validation
    if (required && !value) {
        isValid = false;
        errorMessage = 'Trường này là bắt buộc';
    }

    // Type-specific validation
    if (value && isValid) {
        switch (type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Email không hợp lệ';
                }
                break;
                
            case 'password':
                if (value.length < 6) {
                    isValid = false;
                    errorMessage = 'Mật khẩu phải có ít nhất 6 ký tự';
                }
                break;
                
            case 'tel':
                const phoneRegex = /^[0-9]{10,11}$/;
                if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                    isValid = false;
                    errorMessage = 'Số điện thoại không hợp lệ';
                }
                break;
        }
    }

    // Custom validation attributes
    const minLength = field.getAttribute('data-min-length');
    if (minLength && value.length < parseInt(minLength)) {
        isValid = false;
        errorMessage = `Tối thiểu ${minLength} ký tự`;
    }

    const maxLength = field.getAttribute('data-max-length');
    if (maxLength && value.length > parseInt(maxLength)) {
        isValid = false;
        errorMessage = `Tối đa ${maxLength} ký tự`;
    }

    // Show error if invalid
    if (!isValid) {
        showFieldError(field, errorMessage);
    }

    return isValid;
}

// Validate entire form
function validateForm(form) {
    const fields = form.querySelectorAll('input, textarea, select');
    let isValid = true;

    fields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });

    return isValid;
}

// Show field error
function showFieldError(field, message) {
    field.classList.add('error');
    
    let errorElement = field.parentNode.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
}

// Clear field errors
function clearErrors(field) {
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

// Setup lazy loading for images
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => {
            img.classList.add('lazy');
            imageObserver.observe(img);
        });
    } else {
        // Fallback for older browsers
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

// Check authentication status
function checkAuthStatus() {
    const token = Utils.getToken();
    const user = Utils.getUser();
    
    // Redirect logic for protected pages
    const protectedPages = ['/profile', '/admin', '/orders', '/favorites'];
    const adminPages = ['/admin'];
    const guestPages = ['/login', '/register'];
    
    const currentPath = window.location.pathname;
    
    // Redirect if not authenticated and on protected page
    if (!token && protectedPages.some(page => currentPath.startsWith(page))) {
        window.location.href = './login.html?redirect=' + encodeURIComponent(currentPath);
        return;
    }
    
    // Redirect if authenticated and on guest page
    if (token && guestPages.includes(currentPath)) {
        window.location.href = './index.html';
        return;
    }
    
    // Redirect if not admin and on admin page
    if (adminPages.some(page => currentPath.startsWith(page))) {
        if (!user || user.role !== 'admin') {
            Utils.showToast('Bạn không có quyền truy cập trang này', 'error');
            window.location.href = './index.html';
            return;
        }
    }
    
    // Update UI based on auth state
    Utils.updateAuthUI(user);
}

// Setup page-specific functionality
function setupPageSpecificFunctions() {
    const path = window.location.pathname;
    
    if (path.includes('login.html') || path.endsWith('/login')) {
        setupLoginPage();
    } else if (path.includes('register.html') || path.endsWith('/register')) {
        setupRegisterPage();
    } else if (path.includes('products.html') || path.endsWith('/products')) {
        setupProductsPage();
    } else if (path.includes('cart.html') || path.endsWith('/cart')) {
        setupCartPage();
    } else if (path.includes('profile.html') || path.endsWith('/profile')) {
        setupProfilePage();
    } else if (path.includes('admin.html') || path.endsWith('/admin')) {
        setupAdminPage();
    } else if (path.includes('orders.html') || path.endsWith('/orders')) {
        setupOrdersPage();
    } else if (path.includes('/product/')) {
        setupProductDetailPage();
    }
}

// Login page functionality
function setupLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const credentials = {
            username: formData.get('username'),
            password: formData.get('password')
        };
        
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Đang đăng nhập...';
            
            const response = await API.auth.login(credentials);
            Utils.showToast('Đăng nhập thành công!');
            
            // Redirect to intended page or home
            const urlParams = new URLSearchParams(window.location.search);
            const redirectUrl = urlParams.get('redirect') || '/';
            window.location.href = redirectUrl;
            
        } catch (error) {
            Utils.showToast(error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Register page functionality
function setupRegisterPage() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(registerForm);
        const userData = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            phone: formData.get('phone'),
            full_name: formData.get('full_name')
        };
        
        // Confirm password validation
        const confirmPassword = formData.get('confirmPassword');
        if (userData.password !== confirmPassword) {
            Utils.showToast('Mật khẩu xác nhận không khớp', 'error');
            return;
        }
        
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Đang đăng ký...';
            
            const response = await API.auth.register(userData);
            Utils.showToast('Đăng ký thành công!');
            window.location.href = './index.html';
            
        } catch (error) {
            Utils.showToast(error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Products page functionality
function setupProductsPage() {
    // This will be implemented in a separate products.js file
    console.log('Setting up products page');
}

// Cart page functionality
function setupCartPage() {
    // This will be implemented in cart.js file
    console.log('Setting up cart page');
}

// Profile page functionality
function setupProfilePage() {
    Components.initLayout({ activePage: 'profile', subNavTitle: 'Tài khoản của tôi' });
    
    // Check authentication
    if (!AuthUtils.protectRoute()) return;
    
    const loadingState = document.getElementById('loadingState');
    const profileLayout = document.getElementById('profileLayout');
    
    // Load profile data
    async function loadProfileData() {
        try {
            const response = await API.auth.getProfile();
            const user = response.user;
            
            if (!user) throw new Error('Không thể tải thông tin người dùng');
            
            // Populate Sidebar
            document.getElementById('sidebarAvatar').textContent = AuthUtils.getUserInitials(user);
            document.getElementById('sidebarName').textContent = AuthUtils.getUserDisplayName(user);
            document.getElementById('sidebarEmail').textContent = user.email || '';
            
            // Populate Form
            document.getElementById('username').value = user.username || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('fullName').value = user.full_name || '';
            document.getElementById('phone').value = user.phone || '';
            document.getElementById('address').value = user.address || '';
            
            // Show content
            loadingState.style.display = 'none';
            profileLayout.style.display = 'grid';
            
        } catch (error) {
            console.error('Error loading profile:', error);
            Utils.showToast('Không thể tải thông tin cá nhân. Vui lòng thử lại sau.', 'error');
        }
    }
    
    loadProfileData();
    
    // Handle Profile Form Submit
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('updateProfileBtn');
            const originalText = submitBtn.textContent;
            
            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Đang lưu...';
                
                const profileData = {
                    full_name: document.getElementById('fullName').value.trim(),
                    phone: document.getElementById('phone').value.trim(),
                    address: document.getElementById('address').value.trim()
                };
                
                await API.auth.updateProfile(profileData);
                
                // Cập nhật lại sidebar sau khi lưu thành công
                const updatedUser = Utils.getUser();
                if (updatedUser) {
                    updatedUser.full_name = profileData.full_name;
                    updatedUser.phone = profileData.phone;
                    updatedUser.address = profileData.address;
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    
                    document.getElementById('sidebarName').textContent = AuthUtils.getUserDisplayName(updatedUser);
                    document.getElementById('sidebarAvatar').textContent = AuthUtils.getUserInitials(updatedUser);
                    
                    // Update global navigation
                    AuthUtils.updateNavigation();
                }
                
                Utils.showToast('Cập nhật thông tin thành công!', 'success');
            } catch (error) {
                console.error('Update profile error:', error);
                Utils.showToast(error.message || 'Cập nhật thất bại', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
    
    // Handle Password Form Submit
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (newPassword !== confirmPassword) {
                Utils.showToast('Mật khẩu mới và xác nhận mật khẩu không khớp', 'error');
                return;
            }
            
            if (newPassword.length < 6) {
                Utils.showToast('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
                return;
            }
            
            const submitBtn = document.getElementById('changePasswordBtn');
            const originalText = submitBtn.textContent;
            
            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Đang xử lý...';
                
                await API.auth.changePassword({
                    currentPassword: currentPassword,
                    newPassword: newPassword
                });
                
                Utils.showToast('Đổi mật khẩu thành công!', 'success');
                passwordForm.reset();
            } catch (error) {
                console.error('Change password error:', error);
                Utils.showToast(error.message || 'Đổi mật khẩu thất bại', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
    
    // Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            AuthUtils.handleLogout();
        });
    }
}

// Admin page functionality
function setupAdminPage() {
    // This will be implemented when creating admin.html
    console.log('Setting up admin page');
}

// Orders page functionality
function setupOrdersPage() {
    Components.initLayout({ activePage: 'orders', subNavTitle: 'Quản lý đơn hàng' });
    
    // Check authentication
    if (!AuthUtils.protectRoute()) return;
    
    const loadingState = document.getElementById('loadingState');
    const profileLayout = document.getElementById('profileLayout');
    const ordersList = document.getElementById('ordersList');
    
    // Load profile data for sidebar
    async function loadSidebarData() {
        try {
            const user = Utils.getUser();
            if (user) {
                document.getElementById('sidebarAvatar').textContent = AuthUtils.getUserInitials(user);
                document.getElementById('sidebarName').textContent = AuthUtils.getUserDisplayName(user);
                document.getElementById('sidebarEmail').textContent = user.email || '';
            }
        } catch (error) {
            console.error('Error loading sidebar:', error);
        }
    }
    
    // Load user orders
    async function loadOrders() {
        try {
            const response = await API.orders.getUserOrders();
            const orders = response.orders || [];
            
            if (orders.length === 0) {
                ordersList.innerHTML = `
                    <div class="empty-orders">
                        <i class="fas fa-box-open"></i>
                        <h3>Bạn chưa có đơn hàng nào</h3>
                        <p style="margin: 16px 0;">Hãy khám phá các sản phẩm tuyệt vời của chúng tôi</p>
                        <a href="./product.html" class="btn btn-primary">Mua sắm ngay</a>
                    </div>
                `;
            } else {
                ordersList.innerHTML = orders.map(order => renderOrderCard(order)).join('');
            }
            
            // Show content
            loadingState.style.display = 'none';
            profileLayout.style.display = 'grid';
            
        } catch (error) {
            console.error('Error loading orders:', error);
            ordersList.innerHTML = `
                <div class="alert alert-error" style="margin-top: 24px;">
                    <i class="fas fa-exclamation-circle"></i>
                    Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.
                </div>
            `;
            loadingState.style.display = 'none';
            profileLayout.style.display = 'grid';
        }
    }
    
    function renderOrderCard(order) {
        const statusMap = {
            'pending': { text: 'Chờ xử lý', class: 'status-pending' },
            'processing': { text: 'Đang xử lý', class: 'status-processing' },
            'shipped': { text: 'Đang giao hàng', class: 'status-shipped' },
            'delivered': { text: 'Đã giao', class: 'status-delivered' },
            'cancelled': { text: 'Đã hủy', class: 'status-cancelled' }
        };
        
        const status = statusMap[order.status] || { text: order.status, class: 'status-pending' };
        const orderDate = Utils.formatDate(order.created_at);
        const totalAmount = Utils.formatCurrency(order.total_amount);
        
        const itemsHtml = (order.items || []).map(item => `
            <div class="order-item">
                <img src="${item.image_url || '/images/placeholder.jpg'}" alt="${item.product_name}" class="order-item-image" onerror="this.src='/images/placeholder.jpg'">
                <div class="order-item-details">
                    <div class="order-item-name">${item.product_name}</div>
                    <div class="order-item-meta">
                        ${item.color ? `Màu: ${item.color}` : ''}
                        ${item.color && item.size ? ' | ' : ''}
                        ${item.size ? `Size: ${item.size}` : ''}
                        <br>Số lượng: ${item.quantity}
                    </div>
                </div>
                <div class="order-item-price">${Utils.formatCurrency(item.price)}</div>
            </div>
        `).join('');
        
        return `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <div class="order-id">Đơn hàng #${order.id || order.order_id}</div>
                        <div class="order-date">${orderDate}</div>
                    </div>
                    <div class="order-status ${status.class}">
                        ${status.text}
                    </div>
                </div>
                
                <div class="order-items">
                    ${itemsHtml}
                </div>
                
                <div class="order-footer">
                    <div class="order-total-label">Tổng cộng</div>
                    <div class="order-total-amount">${totalAmount}</div>
                </div>
                
                ${order.status === 'pending' ? `
                <div style="margin-top: 16px; text-align: right;">
                    <button class="btn btn-secondary-pill" onclick="cancelOrder(${order.id || order.order_id})" style="padding: 8px 16px; font-size: 14px; border: 1px solid #e74c3c; color: #e74c3c;">
                        Hủy đơn hàng
                    </button>
                </div>
                ` : ''}
            </div>
        `;
    }
    
    // Setup cancel order function globally so inline onclick can access it
    window.cancelOrder = async function(orderId) {
        if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
        
        try {
            await API.orders.cancelOrder(orderId);
            Utils.showToast('Hủy đơn hàng thành công', 'success');
            loadOrders(); // Reload the list
        } catch (error) {
            console.error('Cancel order error:', error);
            Utils.showToast(error.message || 'Không thể hủy đơn hàng', 'error');
        }
    };
    
    loadSidebarData();
    loadOrders();
    
    // Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            AuthUtils.handleLogout();
        });
    }
}

// Product detail page functionality
function setupProductDetailPage() {
    // This will be implemented when creating product.html
    console.log('Setting up product detail page');
}

// Utility functions for common UI operations

// Show/hide loading overlay
function showPageLoading() {
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.innerHTML = `
            <div class="loading-overlay">
                <div class="loading-spinner"></div>
                <p>Đang tải...</p>
            </div>
        `;
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
}

function hidePageLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Format number with thousand separators
function formatNumber(num) {
    return new Intl.NumberFormat('vi-VN').format(num);
}

// Truncate text
function truncateText(text, length = 100) {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

// Get URL parameters
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Update URL without reload
function updateUrlParameter(param, value) {
    const url = new URL(window.location);
    if (value) {
        url.searchParams.set(param, value);
    } else {
        url.searchParams.delete(param);
    }
    window.history.pushState({}, '', url);
}

// Export utility functions to global scope
window.MainUtils = {
    showPageLoading,
    hidePageLoading,
    formatNumber,
    truncateText,
    getUrlParameter,
    updateUrlParameter,
    validateField,
    validateForm,
    showFieldError,
    clearErrors
};

// Add CSS for lazy loading images
const lazyLoadCSS = `
    .lazy {
        opacity: 0;
        transition: opacity 0.3s;
    }
    
    .lazy.loaded {
        opacity: 1;
    }
    
    .loading-overlay {
        text-align: center;
        color: white;
    }
    
    .loading-overlay .loading-spinner {
        margin-bottom: 20px;
    }
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = lazyLoadCSS;
document.head.appendChild(style);