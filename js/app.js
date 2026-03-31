/* ==========================================
   绍兴智洁洗涤用品科技有限公司 - 核心应用逻辑
   ========================================== */

// ========== Product Data ==========
const PRODUCTS = [
  {
    id: 1,
    name: '妙可净薰衣草婴幼儿洗衣液',
    subtitle: '轻松呵护 亲肤好衣',
    category: 'baby',
    price: 1999.00,
    originalPrice: null,
    badge: 'hot',
    color: 'lavender',
    description: '婴幼儿专用洗护专家，采用植物配方，温润好肤。精选优质薰衣草精华，深层洁净的同时呵护宝宝娇嫩肌肤。',
    features: [
      '高洁温和 - 专为婴幼儿设计的温和配方',
      '真净蛋白 深层焕活 - 蛋白酶深层分解污渍',
      '植物配方 温润好肤 - 天然植物精华，不伤肌肤',
      '精选植物精华呵护好肤 - 薰衣草精油舒缓安神'
    ],
    ingredients: ['薰衣草精华', '天然椰子油', '植物蛋白酶'],
    specs: '500ml/袋',
    slogan: '一包小小的 宝贝大大的'
  },
  {
    id: 2,
    name: '妙可净柠檬去油洗洁精',
    subtitle: '本草洗护 全净呵护',
    category: 'kitchen',
    price: 1999.00,
    originalPrice: null,
    badge: 'hot',
    color: 'lemon',
    description: '去除油污除菌专家，天然柠檬精华，抑菌净享。强效去油净味，花香焕新，让厨房洁净如新。',
    features: [
      '天然柠檬 抑菌净享 - 柠檬精华天然抑菌',
      '去油净味 花香焕新 - 强效去除顽固油污',
      '天然植物精华 洁净更安心 - 食品级安全配方',
      '本草洗护 全净呵护 - 中草药配方温和不伤手'
    ],
    ingredients: ['天然柠檬精华', '茶树精油', '竹纤维提取物'],
    specs: '500ml/袋',
    slogan: '去除油污除菌专家'
  }
];

// ========== Cart Management ==========
class CartManager {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('zhijie_cart') || '[]');
    this.updateBadge();
  }

  addItem(productId, quantity = 1) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const existing = this.items.find(item => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({
        productId,
        quantity,
        name: product.name,
        price: product.price,
        color: product.color
      });
    }
    this.save();
    showToast(`已添加 ${product.name} 到购物车`);
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.productId !== productId);
    this.save();
  }

  updateQuantity(productId, quantity) {
    const item = this.items.find(i => i.productId === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.save();
    }
  }

  getTotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  getItemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  clear() {
    this.items = [];
    this.save();
  }

  save() {
    localStorage.setItem('zhijie_cart', JSON.stringify(this.items));
    this.updateBadge();
  }

  updateBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const count = this.getItemCount();
    badges.forEach(badge => {
      badge.textContent = count || '';
      badge.setAttribute('data-count', count);
    });
  }
}

// ========== Order Management ==========
class OrderManager {
  constructor() {
    this.orders = JSON.parse(localStorage.getItem('zhijie_orders') || '[]');
  }

  createOrder(orderData) {
    const order = {
      id: 'ZJ' + Date.now().toString().slice(-8),
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.orders.unshift(order);
    this.save();
    return order;
  }

  updateStatus(orderId, status) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      this.save();
    }
  }

  deleteOrder(orderId) {
    this.orders = this.orders.filter(o => o.id !== orderId);
    this.save();
  }

  getByStatus(status) {
    if (status === 'all') return this.orders;
    return this.orders.filter(o => o.status === status);
  }

  getStats() {
    return {
      total: this.orders.length,
      pending: this.orders.filter(o => o.status === 'pending').length,
      processing: this.orders.filter(o => o.status === 'processing').length,
      shipped: this.orders.filter(o => o.status === 'shipped').length,
      delivered: this.orders.filter(o => o.status === 'delivered').length,
      cancelled: this.orders.filter(o => o.status === 'cancelled').length,
      revenue: this.orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.total, 0)
    };
  }

  save() {
    localStorage.setItem('zhijie_orders', JSON.stringify(this.orders));
  }
}

// ========== Global Instances ==========
const cart = new CartManager();
const orderManager = new OrderManager();

// ========== Utility Functions ==========
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  toast.innerHTML = `<span>${icons[type] || '✓'}</span> ${message}`;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function formatPrice(price) {
  return price.toFixed(2);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function getStatusText(status) {
  const map = {
    pending: '待处理',
    processing: '处理中',
    shipped: '已发货',
    delivered: '已完成',
    cancelled: '已取消'
  };
  return map[status] || status;
}

function getStatusClass(status) {
  return `status-${status}`;
}

function getProductById(id) {
  return PRODUCTS.find(p => p.id === id);
}

function getBadgeText(badge) {
  const map = { hot: '热卖', new: '新品', sale: '特惠' };
  return map[badge] || '';
}

function getBadgeClass(badge) {
  const map = { hot: 'badge-hot', new: 'badge-new', sale: 'badge-sale' };
  return map[badge] || '';
}

function getColorClass(color) {
  const map = { lavender: 'lavender', lemon: 'lemon', bundle: 'bundle' };
  return map[color] || 'lavender';
}

function getBottleClass(color) {
  const map = { lavender: 'purple-bottle', lemon: 'yellow-bottle', bundle: 'green-bottle' };
  return map[color] || 'purple-bottle';
}

function getBottleLabel(color) {
  return '妙可净';
}

// ========== Header Scroll Effect ==========
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  });

  // Mobile toggle
  const toggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });
  }
}

// ========== Hero Slider ==========
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  if (slides.length === 0) return;

  let current = 0;
  let interval;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  function startAuto() {
    interval = setInterval(() => goTo(current + 1), 5000);
  }

  function stopAuto() {
    clearInterval(interval);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      stopAuto();
      goTo(i);
      startAuto();
    });
  });

  const prevBtn = document.querySelector('.hero-arrow.prev');
  const nextBtn = document.querySelector('.hero-arrow.next');

  if (prevBtn) prevBtn.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });

  startAuto();
}

// ========== Render Product Cards ==========
function renderProductCards(containerId, productIds) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const products = productIds
    ? PRODUCTS.filter(p => productIds.includes(p.id))
    : PRODUCTS;

  container.innerHTML = products.map(p => `
    <div class="product-card" onclick="window.location.href='product-detail.html?id=${p.id}'">
      <div class="product-card-image ${getColorClass(p.color)}">
        ${p.badge ? `<span class="product-badge ${getBadgeClass(p.badge)}">${getBadgeText(p.badge)}</span>` : ''}
        <img class="product-card-img" src="images/product-${p.color === 'lavender' ? 'lavender' : 'lemon'}.svg" alt="${p.name}">
      </div>
      <div class="product-card-body">
        <div class="product-card-title">${p.name}</div>
        <div class="product-card-desc">${p.description}</div>
        <div class="product-card-footer">
          <div class="product-price">
            <span class="currency">¥</span>${formatPrice(p.price)}
            ${p.originalPrice ? `<span class="original">¥${formatPrice(p.originalPrice)}</span>` : ''}
          </div>
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); cart.addItem(${p.id})">加入购物车</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ========== Render Cart Page ==========
function renderCart() {
  const itemsContainer = document.getElementById('cart-items');
  const summaryContainer = document.getElementById('cart-summary-content');
  if (!itemsContainer) return;

  if (cart.items.length === 0) {
    itemsContainer.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p>购物车是空的</p>
        <a href="products.html" class="btn btn-primary mt-20">去购物</a>
      </div>`;
    if (summaryContainer) {
      summaryContainer.innerHTML = '<p style="text-align:center;color:var(--gray-400);">暂无商品</p>';
    }
    return;
  }

  itemsContainer.innerHTML = cart.items.map(item => `
    <div class="cart-item">
      <div class="cart-item-image ${getColorClass(item.color)}">
        <div style="font-size:1.5rem;">📦</div>
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-desc">单价: ¥${formatPrice(item.price)}</div>
        <div class="quantity-selector" style="margin-top:8px;margin-bottom:0;">
          <button class="qty-btn" onclick="updateCartQty(${item.productId}, ${item.quantity - 1})">−</button>
          <input class="qty-input" type="number" value="${item.quantity}" min="1"
            onchange="updateCartQty(${item.productId}, parseInt(this.value) || 1)">
          <button class="qty-btn" onclick="updateCartQty(${item.productId}, ${item.quantity + 1})">+</button>
        </div>
      </div>
      <div class="cart-item-price">¥${formatPrice(item.price * item.quantity)}</div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.productId})">✕</button>
    </div>
  `).join('');

  const subtotal = cart.getTotal();
  const shipping = subtotal >= 99 ? 0 : 10;
  const total = subtotal + shipping;

  if (summaryContainer) {
    summaryContainer.innerHTML = `
      <div class="summary-row"><span>商品小计</span><span>¥${formatPrice(subtotal)}</span></div>
      <div class="summary-row"><span>运费</span><span>${shipping === 0 ? '免运费' : '¥' + formatPrice(shipping)}</span></div>
      ${shipping === 0 ? '<div class="summary-row" style="color:var(--success);font-size:0.85rem;"><span>✓ 满99元免运费</span></div>' : '<div class="summary-row" style="color:var(--warning);font-size:0.85rem;"><span>还差¥' + formatPrice(99 - subtotal) + '免运费</span></div>'}
      <div class="summary-row total"><span>合计</span><span class="amount">¥${formatPrice(total)}</span></div>
    `;
  }
}

function updateCartQty(productId, qty) {
  if (qty < 1) {
    removeFromCart(productId);
    return;
  }
  cart.updateQuantity(productId, qty);
  renderCart();
}

function removeFromCart(productId) {
  cart.removeItem(productId);
  renderCart();
  showToast('已从购物车移除', 'info');
}

function proceedToCheckout() {
  if (cart.items.length === 0) {
    showToast('购物车为空', 'error');
    return;
  }
  window.location.href = 'checkout.html';
}

// ========== Render Checkout Page ==========
function renderCheckout() {
  const orderItems = document.getElementById('checkout-order-items');
  const orderTotal = document.getElementById('checkout-total');
  if (!orderItems) return;

  if (cart.items.length === 0) {
    window.location.href = 'cart.html';
    return;
  }

  orderItems.innerHTML = cart.items.map(item => `
    <div class="order-item-row">
      <span class="order-item-name">${item.name}</span>
      <span class="order-item-qty">x${item.quantity}</span>
      <span class="order-item-price">¥${formatPrice(item.price * item.quantity)}</span>
    </div>
  `).join('');

  const subtotal = cart.getTotal();
  const shipping = subtotal >= 99 ? 0 : 10;
  const total = subtotal + shipping;

  if (orderTotal) {
    orderTotal.innerHTML = `
      <div class="summary-row"><span>商品小计</span><span>¥${formatPrice(subtotal)}</span></div>
      <div class="summary-row"><span>运费</span><span>${shipping === 0 ? '免运费' : '¥' + formatPrice(shipping)}</span></div>
      <div class="summary-row total"><span>应付总额</span><span class="amount">¥${formatPrice(total)}</span></div>
    `;
  }
}

function submitOrder(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const name = formData.get('name')?.trim();
  const phone = formData.get('phone')?.trim();
  const address = formData.get('address')?.trim();

  if (!name || !phone || !address) {
    showToast('请填写完整的收货信息', 'error');
    return;
  }

  if (!/^1\d{10}$/.test(phone)) {
    showToast('请输入正确的手机号码', 'error');
    return;
  }

  const subtotal = cart.getTotal();
  const shipping = subtotal >= 99 ? 0 : 10;

  const order = orderManager.createOrder({
    items: cart.items.map(item => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    })),
    customer: {
      name,
      phone,
      province: formData.get('province') || '',
      city: formData.get('city') || '',
      address,
      note: formData.get('note') || ''
    },
    subtotal,
    shipping,
    total: subtotal + shipping
  });

  cart.clear();
  showToast('订单提交成功！');

  setTimeout(() => {
    window.location.href = `orders.html?highlight=${order.id}`;
  }, 1000);
}

// ========== Render Orders Page ==========
function renderOrders(statusFilter = 'all') {
  const container = document.getElementById('orders-list');
  if (!container) return;

  const orders = orderManager.getByStatus(statusFilter);

  // Update tab active state
  document.querySelectorAll('.orders-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.status === statusFilter);
  });

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">📋</div>
        <p>暂无订单</p>
        <a href="products.html" class="btn btn-primary mt-20">去购物</a>
      </div>`;
    return;
  }

  container.innerHTML = orders.map(order => `
    <div class="order-card" id="order-${order.id}">
      <div class="order-header">
        <div>
          <span class="order-id">订单号: ${order.id}</span>
          <span class="order-date" style="margin-left:16px;">${formatDate(order.createdAt)}</span>
        </div>
        <span class="order-status ${getStatusClass(order.status)}">${getStatusText(order.status)}</span>
      </div>
      <div class="order-body">
        <div class="order-items-list">
          ${order.items.map(item => `
            <div class="order-item-row">
              <span class="order-item-name">${item.name}</span>
              <span class="order-item-qty">x${item.quantity}</span>
              <span class="order-item-price">¥${formatPrice(item.price * item.quantity)}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="order-footer">
        <div class="order-total">
          共 ${order.items.reduce((s, i) => s + i.quantity, 0)} 件商品，
          合计: <span class="amount">¥${formatPrice(order.total)}</span>
        </div>
        <div class="order-actions">
          ${order.status === 'pending' ? `<button class="btn btn-danger btn-sm" onclick="cancelOrder('${order.id}')">取消订单</button>` : ''}
          ${order.status === 'delivered' ? `<button class="btn btn-primary btn-sm" onclick="reorder('${order.id}')">再次购买</button>` : ''}
        </div>
      </div>
    </div>
  `).join('');

  // Highlight order if needed
  const params = new URLSearchParams(window.location.search);
  const highlight = params.get('highlight');
  if (highlight) {
    const el = document.getElementById(`order-${highlight}`);
    if (el) {
      el.style.border = '2px solid var(--primary)';
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

function cancelOrder(orderId) {
  if (confirm('确定要取消此订单吗？')) {
    orderManager.updateStatus(orderId, 'cancelled');
    renderOrders(document.querySelector('.orders-tab.active')?.dataset.status || 'all');
    showToast('订单已取消', 'info');
  }
}

function reorder(orderId) {
  const order = orderManager.orders.find(o => o.id === orderId);
  if (!order) return;
  order.items.forEach(item => cart.addItem(item.productId, item.quantity));
  window.location.href = 'cart.html';
}

// ========== Admin Page ==========
function renderAdmin(statusFilter = 'all') {
  renderAdminStats();
  renderAdminOrders(statusFilter);
}

function renderAdminStats() {
  const stats = orderManager.getStats();
  const els = {
    'stat-total': stats.total,
    'stat-pending': stats.pending,
    'stat-processing': stats.processing + stats.shipped,
    'stat-revenue': '¥' + formatPrice(stats.revenue)
  };

  Object.entries(els).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });
}

function renderAdminOrders(statusFilter = 'all') {
  const tbody = document.getElementById('admin-orders-tbody');
  if (!tbody) return;

  const orders = orderManager.getByStatus(statusFilter);

  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--gray-400);">暂无订单</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map(order => `
    <tr>
      <td><strong>${order.id}</strong></td>
      <td>${order.customer.name}</td>
      <td>${order.customer.phone}</td>
      <td>${order.items.map(i => `${i.name} x${i.quantity}`).join('<br>')}</td>
      <td><strong style="color:var(--danger);">¥${formatPrice(order.total)}</strong></td>
      <td><span class="order-status ${getStatusClass(order.status)}">${getStatusText(order.status)}</span></td>
      <td>
        <div style="display:flex;gap:4px;flex-wrap:wrap;">
          ${order.status === 'pending' ? `
            <button class="action-btn" onclick="adminUpdateStatus('${order.id}', 'processing')">确认</button>
            <button class="action-btn" onclick="adminUpdateStatus('${order.id}', 'cancelled')" style="color:var(--danger);">取消</button>
          ` : ''}
          ${order.status === 'processing' ? `
            <button class="action-btn" onclick="adminUpdateStatus('${order.id}', 'shipped')">发货</button>
          ` : ''}
          ${order.status === 'shipped' ? `
            <button class="action-btn" onclick="adminUpdateStatus('${order.id}', 'delivered')">确认收货</button>
          ` : ''}
          <button class="action-btn" onclick="viewOrderDetail('${order.id}')">详情</button>
          ${order.status === 'cancelled' || order.status === 'delivered' ? `
            <button class="action-btn" onclick="adminDeleteOrder('${order.id}')" style="color:var(--danger);">删除</button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

function adminUpdateStatus(orderId, status) {
  const statusText = getStatusText(status);
  if (confirm(`确定将订单 ${orderId} 状态更新为"${statusText}"吗？`)) {
    orderManager.updateStatus(orderId, status);
    renderAdmin(document.getElementById('admin-status-filter')?.value || 'all');
    showToast(`订单已更新为"${statusText}"`);
  }
}

function adminDeleteOrder(orderId) {
  if (confirm(`确定要删除订单 ${orderId} 吗？此操作不可恢复。`)) {
    orderManager.deleteOrder(orderId);
    renderAdmin(document.getElementById('admin-status-filter')?.value || 'all');
    showToast('订单已删除', 'info');
  }
}

function viewOrderDetail(orderId) {
  const order = orderManager.orders.find(o => o.id === orderId);
  if (!order) return;

  const modal = document.getElementById('order-detail-modal');
  const content = document.getElementById('order-detail-content');
  if (!modal || !content) return;

  content.innerHTML = `
    <div style="margin-bottom:20px;">
      <h3 style="margin-bottom:12px;">订单信息</h3>
      <p><strong>订单号:</strong> ${order.id}</p>
      <p><strong>状态:</strong> <span class="order-status ${getStatusClass(order.status)}">${getStatusText(order.status)}</span></p>
      <p><strong>下单时间:</strong> ${formatDate(order.createdAt)}</p>
      <p><strong>更新时间:</strong> ${formatDate(order.updatedAt)}</p>
    </div>
    <div style="margin-bottom:20px;">
      <h3 style="margin-bottom:12px;">收货信息</h3>
      <p><strong>姓名:</strong> ${order.customer.name}</p>
      <p><strong>电话:</strong> ${order.customer.phone}</p>
      <p><strong>地址:</strong> ${order.customer.province} ${order.customer.city} ${order.customer.address}</p>
      ${order.customer.note ? `<p><strong>备注:</strong> ${order.customer.note}</p>` : ''}
    </div>
    <div>
      <h3 style="margin-bottom:12px;">商品明细</h3>
      ${order.items.map(item => `
        <div class="order-item-row">
          <span>${item.name}</span>
          <span>x${item.quantity}</span>
          <span>¥${formatPrice(item.price * item.quantity)}</span>
        </div>
      `).join('')}
      <div style="border-top:2px solid var(--gray-200);margin-top:12px;padding-top:12px;">
        <div class="summary-row"><span>商品小计</span><span>¥${formatPrice(order.subtotal)}</span></div>
        <div class="summary-row"><span>运费</span><span>${order.shipping === 0 ? '免运费' : '¥' + formatPrice(order.shipping)}</span></div>
        <div class="summary-row total"><span>合计</span><span class="amount">¥${formatPrice(order.total)}</span></div>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

// ========== Product Detail Page ==========
function renderProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));
  const product = getProductById(id);

  if (!product) {
    document.getElementById('product-detail-container').innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🔍</div>
        <p>商品不存在</p>
        <a href="products.html" class="btn btn-primary mt-20">返回商品列表</a>
      </div>`;
    return;
  }

  const bgClass = product.color === 'lemon' ? 'lemon-bg' : 'lavender-bg';
  const tagClass = product.color === 'lemon' ? 'yellow' : 'purple';
  const bottleClass = getBottleClass(product.color);

  document.getElementById('product-detail-container').innerHTML = `
    <div class="product-detail-grid">
      <div class="product-gallery ${bgClass}">
        <img class="product-detail-img" src="images/product-${product.color === 'lavender' ? 'lavender' : 'lemon'}.svg" alt="${product.name}">
      </div>
      <div class="product-detail-info">
        <h1>${product.name}</h1>
        <div class="product-detail-subtitle">${product.subtitle} | ${product.specs}</div>
        <div class="product-detail-price">
          <span class="currency">¥</span>${formatPrice(product.price)}
          ${product.originalPrice ? `<span class="original" style="font-size:1rem;color:var(--gray-400);text-decoration:line-through;font-weight:400;margin-left:12px;">¥${formatPrice(product.originalPrice)}</span>` : ''}
        </div>

        <div class="product-detail-features">
          <h3>产品特点</h3>
          <div class="feature-tags">
            ${product.features.map(f => `<span class="feature-tag ${tagClass}">${f.split(' - ')[0]}</span>`).join('')}
          </div>
        </div>

        <div class="quantity-selector">
          <label>数量</label>
          <button class="qty-btn" onclick="changeDetailQty(-1)">−</button>
          <input class="qty-input" type="number" id="detail-qty" value="1" min="1">
          <button class="qty-btn" onclick="changeDetailQty(1)">+</button>
        </div>

        <div class="product-actions">
          <button class="btn btn-primary btn-lg" onclick="addDetailToCart(${product.id})">加入购物车</button>
          <button class="btn btn-secondary btn-lg" onclick="buyNow(${product.id})">立即购买</button>
        </div>

        <div class="product-detail-desc">
          <h3>商品详情</h3>
          <div class="detail-section">
            <h4>${product.slogan}</h4>
            <p>${product.description}</p>
          </div>
          <div class="detail-section">
            <h4>功效特点</h4>
            <ul>
              ${product.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
          </div>
          ${product.ingredients.length > 0 ? `
          <div class="detail-section">
            <h4>核心成分</h4>
            <p>${product.ingredients.join('、')}</p>
          </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function changeDetailQty(delta) {
  const input = document.getElementById('detail-qty');
  if (!input) return;
  input.value = Math.max(1, parseInt(input.value) + delta);
}

function addDetailToCart(productId) {
  const qty = parseInt(document.getElementById('detail-qty')?.value) || 1;
  cart.addItem(productId, qty);
}

function buyNow(productId) {
  const qty = parseInt(document.getElementById('detail-qty')?.value) || 1;
  cart.addItem(productId, qty);
  window.location.href = 'checkout.html';
}

// ========== Initialize on DOM Ready ==========
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initHeroSlider();

  // Auto-init based on page
  if (document.getElementById('home-products')) {
    renderProductCards('home-products');
  }
  if (document.getElementById('all-products')) {
    renderProductCards('all-products');
  }
  if (document.getElementById('cart-items')) {
    renderCart();
  }
  if (document.getElementById('checkout-order-items')) {
    renderCheckout();
  }
  if (document.getElementById('orders-list')) {
    renderOrders('all');
  }
  if (document.getElementById('product-detail-container')) {
    renderProductDetail();
  }
  if (document.getElementById('admin-orders-tbody')) {
    renderAdmin('all');
  }
});
