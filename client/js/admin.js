// Admin.js - Core logic for Admin Dashboard & Orders

const API_BASE_URL = '/api';
let currentOrders = [];
let charts = {};

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Format date
const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleString('vi-VN');
};

// Get Token
const getToken = () => {
    return localStorage.getItem('token');
};

// Check Auth & Role
const checkAuth = () => {
    const token = getToken();
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
        window.location.href = '/login.html';
        return false;
    }
    
    try {
        const user = JSON.parse(userStr);
        if (user.role !== 'admin') {
            alert('Access Denied. You are not an admin.');
            window.location.href = '/index.html';
            return false;
        }
        
        // Update UI
        document.getElementById('admin-name').innerText = user.full_name || user.username || 'Admin';
        document.getElementById('admin-avatar').innerText = (user.full_name || user.username || 'A').charAt(0).toUpperCase();
        return true;
    } catch (e) {
        window.location.href = '/login.html';
        return false;
    }
};

// Generic API Fetcher
const fetchAPI = async (endpoint, options = {}) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };
    
    try {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.message || 'API request failed');
        }
        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
};

// Show Toast Notification
const showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// ----------------------------------------------------
// DASHBOARD LOGIC
// ----------------------------------------------------
const loadDashboardStats = async () => {
    try {
        // Fetch stats
        const data = await fetchAPI('/orders/admin/stats');
        
        // Update KPIs
        const overview = data.overview || {};
        document.getElementById('kpi-revenue').innerText = formatCurrency(overview.total_revenue || 0);
        document.getElementById('kpi-orders').innerText = overview.total_orders || 0;
        document.getElementById('kpi-pending').innerText = overview.pending_orders || 0;
        
        // Also fetch total customers
        try {
            const usersData = await fetchAPI('/users/all');
            document.getElementById('kpi-customers').innerText = usersData.users ? usersData.users.length : 0;
        } catch(e) {
            console.error('Could not fetch users', e);
        }

        renderCharts(data);
        
    } catch (error) {
        showToast('Failed to load dashboard statistics', 'error');
    }
};

const renderCharts = (data) => {
    const { monthly_revenue = [], overview = {}, top_products = [] } = data;
    
    // 1. Revenue Chart (Line)
    const ctxRevenue = document.getElementById('revenueChart');
    if (charts.revenue) charts.revenue.destroy();
    
    const labels = monthly_revenue.map(item => `Th�ng ${item.month}/${item.year}`).reverse();
    const revenues = monthly_revenue.map(item => item.revenue).reverse();
    const orders = monthly_revenue.map(item => item.order_count).reverse();
    
    charts.revenue = new Chart(ctxRevenue, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Revenue (VND)',
                    data: revenues,
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    yAxisID: 'y',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Orders Count',
                    data: orders,
                    type: 'bar',
                    backgroundColor: '#f8961e',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { type: 'linear', display: true, position: 'left' },
                y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } }
            }
        }
    });

    // 2. Status Distribution (Bar)
    const ctxStatus = document.getElementById('statusChart');
    if (charts.status) charts.status.destroy();
    
    charts.status = new Chart(ctxStatus, {
        type: 'bar',
        data: {
            labels: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
            datasets: [{
                label: 'Orders',
                data: [
                    overview.pending_orders || 0,
                    overview.confirmed_orders || 0,
                    overview.shipped_orders || 0,
                    overview.delivered_orders || 0,
                    overview.cancelled_orders || 0
                ],
                backgroundColor: ['#f8961e', '#4cc9f0', '#4895ef', '#2dce89', '#f72585']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });

    // 3. Top Products (Horizontal Bar)
    const ctxTopProducts = document.getElementById('topProductsChart');
    if (charts.topProducts) charts.topProducts.destroy();
    
    charts.topProducts = new Chart(ctxTopProducts, {
        type: 'bar',
        data: {
            labels: top_products.map(p => p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name),
            datasets: [{
                label: 'Units Sold',
                data: top_products.map(p => p.total_sold),
                backgroundColor: '#4361ee'
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
};

const loadRecentOrders = async () => {
    try {
        const data = await fetchAPI('/orders/admin/all?limit=5');
        const tbody = document.querySelector('#recent-orders-table tbody');
        tbody.innerHTML = '';
        
        if (data.orders && data.orders.length > 0) {
            data.orders.forEach(order => {
                tbody.innerHTML += `
                    <tr>
                        <td>#ORD-${order.order_id}</td>
                        <td>${order.full_name || order.username}</td>
                        <td>${formatDate(order.created_at)}</td>
                        <td>${formatCurrency(order.total_amount)}</td>
                        <td><span class="badge badge-${order.status}">${order.status}</span></td>
                    </tr>
                `;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No recent orders</td></tr>';
        }
    } catch (error) {
        console.error('Failed to load recent orders', error);
    }
};

// ----------------------------------------------------
// ORDERS TAB LOGIC
// ----------------------------------------------------
let currentPage = 1;

const loadOrders = async (page = 1) => {
    try {
        currentPage = page;
        
        // Get filters
        const search = document.getElementById('order-search').value;
        const status = document.getElementById('order-status-filter').value;
        // In a real app, date filter would map to from_date and to_date
        
        let query = `/orders/admin/all?page=${page}&limit=10`;
        if (status) query += `&status=${status}`;
        
        const data = await fetchAPI(query);
        currentOrders = data.orders || [];
        
        // If search is used, filter clientside for simplicity unless backend supports it
        let filteredOrders = currentOrders;
        if (search) {
            const s = search.toLowerCase();
            filteredOrders = currentOrders.filter(o => 
                (o.order_id && o.order_id.toString().includes(s)) ||
                (o.full_name && o.full_name.toLowerCase().includes(s)) ||
                (o.email && o.email.toLowerCase().includes(s))
            );
        }
        
        renderOrdersTable(filteredOrders);
        renderPagination(data.pagination);
        
        document.getElementById('total-orders-count').innerText = `Total: ${data.pagination.total_items || 0}`;
        
    } catch (error) {
        showToast('Failed to load orders', 'error');
    }
};

const renderOrdersTable = (orders) => {
    const tbody = document.querySelector('#orders-table tbody');
    tbody.innerHTML = '';
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No orders found</td></tr>';
        return;
    }
    
    orders.forEach(order => {
        tbody.innerHTML += `
            <tr>
                <td><strong>#ORD-${order.order_id}</strong></td>
                <td>
                    <div>${order.full_name || order.username}</div>
                    <div style="font-size:0.8rem; color:#718096;">${order.email || ''}</div>
                </td>
                <td>${formatDate(order.created_at)}</td>
                <td>${order.item_count} items</td>
                <td>${formatCurrency(order.total_amount)}</td>
                <td><span class="badge badge-${order.status}">${order.status.toUpperCase()}</span></td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="openOrderModal(${order.order_id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `;
    });
};

const renderPagination = (pagination) => {
    const container = document.getElementById('orders-pagination');
    container.innerHTML = '';
    
    if (!pagination || pagination.total_pages <= 1) return;
    
    for (let i = 1; i <= pagination.total_pages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${i === pagination.current_page ? 'active' : ''}`;
        btn.innerText = i;
        btn.onclick = () => loadOrders(i);
        container.appendChild(btn);
    }
};

// ----------------------------------------------------
// ORDER MODAL LOGIC
// ----------------------------------------------------
const openOrderModal = async (orderId) => {
    const modal = document.getElementById('order-modal');
    modal.classList.add('show');
    
    document.getElementById('order-modal-content').style.display = 'none';
    document.getElementById('order-modal-loading').style.display = 'block';
    
    try {
        const data = await fetchAPI(`/orders/${orderId}`);
        const order = data.order;
        
        document.getElementById('modal-order-title').innerText = `Order #ORD-${order.order_id}`;
        document.getElementById('modal-customer-name').innerText = order.full_name || order.username;
        document.getElementById('modal-customer-contact').innerText = `${order.email} / ${order.phone || 'N/A'}`;
        document.getElementById('modal-address').innerText = order.shipping_address || 'N/A';
        document.getElementById('modal-date').innerText = formatDate(order.created_at);
        document.getElementById('modal-order-id').value = order.order_id;
        
        // Update status dropdown
        const statusSelect = document.getElementById('modal-status-select');
        statusSelect.value = order.status;
        
        // Disable updates if cancelled
        if (order.status === 'cancelled') {
            statusSelect.disabled = true;
            document.getElementById('btn-update-status').disabled = true;
        } else {
            statusSelect.disabled = false;
            document.getElementById('btn-update-status').disabled = false;
        }
        
        // Items
        const tbody = document.getElementById('modal-items-tbody');
        tbody.innerHTML = '';
        order.items.forEach(item => {
            tbody.innerHTML += `
                <tr>
                    <td>
                        <div style="font-weight:500;">${item.name}</div>
                        ${item.color ? `<div style="font-size:0.8rem;color:#718096;">Color: ${item.color}</div>` : ''}
                    </td>
                    <td>${item.quantity}</td>
                    <td>${formatCurrency(item.price)}</td>
                    <td>${formatCurrency(item.price * item.quantity)}</td>
                </tr>
            `;
        });
        
        document.getElementById('modal-grand-total').innerText = formatCurrency(order.total_amount);
        
        document.getElementById('order-modal-loading').style.display = 'none';
        document.getElementById('order-modal-content').style.display = 'block';
        
    } catch (error) {
        showToast('Failed to load order details', 'error');
        closeOrderModal();
    }
};

const closeOrderModal = () => {
    document.getElementById('order-modal').classList.remove('show');
};

const updateOrderStatus = async () => {
    const orderId = document.getElementById('modal-order-id').value;
    const newStatus = document.getElementById('modal-status-select').value;
    const btn = document.getElementById('btn-update-status');
    
    if (!confirm(`Are you sure you want to change this order status to ${newStatus.toUpperCase()}?`)) return;
    
    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
        
        await fetchAPI(`/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus })
        });
        
        showToast('Order status updated successfully');
        loadOrders(currentPage);
        loadDashboardStats();
        closeOrderModal();
        
    } catch (error) {
        showToast('Failed to update status', 'error');
    } finally {
        btn.disabled = false;
        btn.innerText = 'Update Status';
    }
};

// ----------------------------------------------------
// PRODUCT LOGIC
// ----------------------------------------------------
let currentProductPage = 1;

const loadProducts = async (page = 1) => {
    try {
        currentProductPage = page;
        
        const searchQuery = document.getElementById('product-search').value;
        const categoryFilter = document.getElementById('product-category-filter').value;
        const sortFilter = document.getElementById('product-sort').value;
        
        let query = `/products/admin/all?page=${page}&limit=10&sort=${sortFilter}`;
        if (searchQuery) query += `&search=${encodeURIComponent(searchQuery)}`;
        if (categoryFilter) query += `&category=${encodeURIComponent(categoryFilter)}`;
        
        const data = await API.admin.getAllProducts({
            page, limit: 10, sort: sortFilter, search: searchQuery, category: categoryFilter
        });
        
        const tbody = document.getElementById('products-table-body');
        tbody.innerHTML = '';
        
        if (!data.products || data.products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No products found</td></tr>';
            document.getElementById('products-pagination').innerHTML = '';
            document.getElementById('total-products-count').innerText = 'Total: 0';
            return;
        }
        
        document.getElementById('total-products-count').innerText = `Total: ${data.pagination.total_products}`;
        
        data.products.forEach(product => {
            const tr = document.createElement('tr');
            
            let badges = '';
            if (product.is_featured) badges += '<span class="badge badge-pending" style="background:#f8961e; margin-right:5px">Featured</span>';
            if (product.is_new) badges += '<span class="badge badge-delivered" style="background:#4cc9f0">New</span>';
            if (!badges && product.stock > 0) badges = '<span class="badge" style="background:#e2e8f0; color:#4a5568">Normal</span>';
            if (product.stock <= 0) badges = '<span class="badge badge-cancelled">Out of Stock</span>';
            
            tr.innerHTML = `
                <td><img src="${product.image_url}" alt="${product.name.replace(/"/g, '&quot;')}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
                <td>
                    <div style="font-weight: 500;">${product.name}</div>
                    <div style="font-size: 0.8rem; color: #718096;">${product.brand || 'No Brand'}</div>
                </td>
                <td>${product.category_name}</td>
                <td>${formatCurrency(product.price)}</td>
                <td>${product.stock}</td>
                <td>${badges}</td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="editProduct(${product.product_id})" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-outline btn-sm" onclick="deleteProduct(${product.product_id}, '${product.name.replace(/'/g, "\\'")}')" title="Delete" style="color: var(--danger); border-color: #fbd5e5;"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        renderProductPagination(data.pagination);
        
    } catch (error) {
        showToast('Failed to load products', 'error');
        console.error(error);
    }
};

const renderProductPagination = (pagination) => {
    const container = document.getElementById('products-pagination');
    container.innerHTML = '';
    if (!pagination || pagination.total_pages <= 1) return;
    for (let i = 1; i <= pagination.total_pages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${i === pagination.current_page ? 'active' : ''}`;
        btn.innerText = i;
        btn.onclick = () => loadProducts(i);
        container.appendChild(btn);
    }
};

const loadCategoriesForSelect = async () => {
    try {
        const data = await API.categories.getCategories();
        const filterSelect = document.getElementById('product-category-filter');
        const modalSelect = document.getElementById('product-category');
        
        data.categories.forEach(cat => {
            filterSelect.add(new Option(cat.name, cat.name));
            modalSelect.add(new Option(cat.name, cat.category_id));
        });
    } catch (error) {
        console.error('Failed to load categories', error);
    }
};

let currentEditingProductId = null;

const openProductModal = () => {
    currentEditingProductId = null;
    document.getElementById('product-modal-title').innerText = 'Add Product';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('main-image-preview').style.display = 'none';
    document.getElementById('main-image-preview').src = '';
    document.getElementById('product-modal').classList.add('show');
};

const closeProductModal = () => {
    document.getElementById('product-modal').classList.remove('show');
};

const updateImagePreview = (url, imgId) => {
    const img = document.getElementById(imgId);
    if (url) {
        img.src = url;
        img.style.display = 'block';
    } else {
        img.style.display = 'none';
    }
};

const editProduct = async (id) => {
    try {
        const response = await API.products.getProduct(id);
        const product = response.product || response;
        
        currentEditingProductId = id;
        document.getElementById('product-modal-title').innerText = `Edit Product #${id}`;
        document.getElementById('product-id').value = id;
        
        document.getElementById('product-name').value = product.name || '';
        document.getElementById('product-category').value = product.category_id || '';
        document.getElementById('product-price').value = product.price || 0;
        document.getElementById('product-stock').value = product.stock || 0;
        document.getElementById('product-discount').value = product.discount_percent || 0;
        document.getElementById('product-brand').value = product.brand || '';
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-image').value = product.image_url || '';
        updateImagePreview(product.image_url, 'main-image-preview');
        
        document.getElementById('product-featured').checked = product.is_featured || false;
        document.getElementById('product-new').checked = product.is_new || false;
        
        let colors = product.colors;
        if (typeof colors === 'string') {
            try { colors = JSON.parse(colors); } catch(e) {}
        }
        document.getElementById('product-colors').value = Array.isArray(colors) ? colors.join(', ') : (colors || '');
        
        let sizes = product.sizes;
        if (typeof sizes === 'string') {
            try { sizes = JSON.parse(sizes); } catch(e) {}
        }
        document.getElementById('product-sizes').value = Array.isArray(sizes) ? sizes.join(', ') : (sizes || '');
        
        let images = product.images;
        if (typeof images === 'string') {
            try { images = JSON.parse(images); } catch(e) {}
        }
        document.getElementById('product-images-list').value = Array.isArray(images) ? images.join('\n') : (images || '');
        
        document.getElementById('product-modal').classList.add('show');
    } catch (error) {
        showToast('Failed to fetch product details', 'error');
        console.error(error);
    }
};

const saveProduct = async () => {
    const form = document.getElementById('product-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const btn = document.getElementById('btn-save-product');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    
    try {
        const colorsStr = document.getElementById('product-colors').value;
        const colors = colorsStr ? colorsStr.split(',').map(s => s.trim()).filter(s => s) : [];
        
        const sizesStr = document.getElementById('product-sizes').value;
        const sizes = sizesStr ? sizesStr.split(',').map(s => s.trim()).filter(s => s) : [];
        
        const imagesStr = document.getElementById('product-images-list').value;
        const images = imagesStr ? imagesStr.split('\n').map(s => s.trim()).filter(s => s) : [];

        const payload = {
            name: document.getElementById('product-name').value,
            category_id: parseInt(document.getElementById('product-category').value),
            price: parseFloat(document.getElementById('product-price').value),
            stock: parseInt(document.getElementById('product-stock').value),
            discount_percent: parseInt(document.getElementById('product-discount').value || 0),
            brand: document.getElementById('product-brand').value,
            description: document.getElementById('product-description').value,
            image_url: document.getElementById('product-image').value,
            is_featured: document.getElementById('product-featured').checked,
            is_new: document.getElementById('product-new').checked,
            colors,
            sizes,
            images
        };
        
        if (currentEditingProductId) {
            await API.admin.updateProduct(currentEditingProductId, payload);
            showToast('Product updated successfully', 'success');
        } else {
            await API.admin.createProduct(payload);
            showToast('Product created successfully', 'success');
        }
        
        closeProductModal();
        loadProducts(currentProductPage);
        
    } catch (error) {
        showToast(error.message || 'Failed to save product', 'error');
        console.error(error);
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Save Product';
    }
};

const deleteProduct = async (id, name) => {
    if (!confirm(`Are you sure you want to delete product "${name}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        await API.admin.deleteProduct(id);
        showToast('Product deleted successfully', 'success');
        loadProducts(currentProductPage);
    } catch (error) {
        showToast(error.message || 'Failed to delete product', 'error');
        console.error(error);
    }
};

// ----------------------------------------------------
// INIT & EVENT LISTENERS
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    
    // Setup Tabs
    const menuItems = document.querySelectorAll('.menu-item[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');
    
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');
            
            // Active states
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');
            
            tabContents.forEach(tc => tc.classList.remove('active'));
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            // Title
            document.getElementById('page-title').innerText = item.querySelector('span').innerText;
            
            // Sidebar mobile hide
            if (window.innerWidth <= 992) {
                document.getElementById('sidebar').classList.remove('show');
            }
        });
    });
    
    // Sidebar Toggle
    document.getElementById('menu-toggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('show');
    });
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    });
    
    // Filters
    document.getElementById('btn-apply-order-filters').addEventListener('click', () => {
        loadOrders(1);
    });
    
    // Product Filters
    document.getElementById('product-search').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') loadProducts(1);
    });
    document.getElementById('product-category-filter').addEventListener('change', () => loadProducts(1));
    document.getElementById('product-sort').addEventListener('change', () => loadProducts(1));

    loadCategoriesForSelect();
    loadProducts(1);

    document.getElementById('dashboard-date-filter').addEventListener('change', () => {
        showToast('Date filter applied');
        // In real app, reload stats with date params
    });
    
    // Initialize Data
    loadDashboardStats();
    loadRecentOrders();
    loadOrders(1);
});

