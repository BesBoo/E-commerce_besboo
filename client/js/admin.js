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
            const usersData = await fetchAPI('/users/admin/all');
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
    
    const labels = monthly_revenue.map(item => `Tháng ${item.month}/${item.year}`).reverse();
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
    document.getElementById('dashboard-date-filter').addEventListener('change', () => {
        showToast('Date filter applied');
        // In real app, reload stats with date params
    });
    
    // Initialize Data
    loadDashboardStats();
    loadRecentOrders();
    loadOrders(1);
});
