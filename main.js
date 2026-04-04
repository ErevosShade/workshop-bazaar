/* =====================================================
   CampusBazaar – Main Application Script
   ===================================================== */

// ---------------------------------------------------------------------------
// Data Initialization
// ---------------------------------------------------------------------------

function initData() {
  if (!localStorage.getItem('products')) {
    const defaultProducts = [
      { id: 1, title: 'Engineering Mathematics – 3rd Ed.', description: 'Lightly used, no annotations.', price: 299, category: 'Books', seller: 'alice' },
      { id: 2, title: 'Scientific Calculator FX-991ES', description: 'Works perfectly, all functions intact.', price: 450, category: 'Stationery', seller: 'bob' },
      { id: 3, title: 'Noise-Cancelling Headphones', description: 'Great for focused study sessions.', price: 1200, category: 'Electronics', seller: 'charlie' }
    ];
    localStorage.setItem('products', JSON.stringify(defaultProducts));
  }

  if (!localStorage.getItem('reviews')) {
    const defaultReviews = [
      { id: 1, productId: 1, reviewer: 'dave', text: 'Great book, exactly as described!', rating: 5 },
      { id: 2, productId: 2, reviewer: 'eve', text: 'Calculator works perfectly. Fast delivery.', rating: 4 }
    ];
    localStorage.setItem('reviews', JSON.stringify(defaultReviews));
  }

  if (!localStorage.getItem('cart')) {
    localStorage.setItem('cart', JSON.stringify([]));
  }
}

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

const USERS = [
  { username: 'admin',   password: 'admin123',  role: 'admin'   },
  { username: 'student', password: 'pass1234',  role: 'student' }
];

function login() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const errorEl  = document.getElementById('login-error');

  const match = USERS.find(u => u.username === username && u.password === password);

  if (match) {
    localStorage.setItem('session-user', match.username);
    localStorage.setItem('role', match.role);
    document.getElementById('login-modal').classList.add('hidden');
    errorEl.textContent = '';
    applyRoleBasedUI();
  } else {
    errorEl.textContent = 'Invalid username or password.';
  }
}

function logout() {
  localStorage.removeItem('session-user');
  localStorage.removeItem('role');
  applyRoleBasedUI();
}

function applyRoleBasedUI() {
  const role = localStorage.getItem('role');
  const adminPanel = document.getElementById('admin-dashboard');

  const user = localStorage.getItem('session-user');
  const btnLogin = document.getElementById('authBtn');
  if (role !== 'admin') {
    adminPanel.style.display = 'none';
  } else {
    adminPanel.style.display = 'block';
  }

  if(user){
    btnLogin.textContent = 'Logout';
    btnLogin.onclick = logout;
  } else {
    btnLogin.textContent = 'Login';
    btnLogin.onclick = showLoginModal;
  }
}

function showLoginModal() {
  document.getElementById('login-modal').classList.remove('hidden');
}

// ---------------------------------------------------------------------------
// Product Rendering
// ---------------------------------------------------------------------------

function renderProducts(filter = '') {
  const products = JSON.parse(localStorage.getItem('products')) || [];
  const grid = document.getElementById('product-grid');
  grid.innerHTML = '';

  const filtered = filter
    ? products.filter(p => p.title.toLowerCase().includes(filter.toLowerCase()))
    : products;

  filtered.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';

    // Title
    const title = document.createElement('h3');
    title.textContent = product.title;

    // Description
    const desc = document.createElement('p');
    desc.className = 'product-desc';
    desc.textContent = product.description;

    // Price
    const price = document.createElement('p');
    price.className = 'product-price';
    price.textContent = `₹${product.price}`;

    // Category
    const category = document.createElement('p');
    category.className = 'product-category';
    category.textContent = product.category;

    // Button
    const btn = document.createElement('button');
    btn.textContent = 'Add to Cart';

    // SAFE dataset assignment
    btn.dataset.id = product.id;
    btn.dataset.title = product.title;
    btn.dataset.price = product.price;

    btn.addEventListener('click', () => addToCart(btn));

    // Append everything
    card.append(title, desc, price, category, btn);
    grid.appendChild(card);
  });
}

function searchProducts() {
  const query = document.getElementById('search-input').value;
  renderProducts(query);
}

function addProduct(event) {
  event.preventDefault();
  const title    = document.getElementById('new-title').value.trim();
  const desc     = document.getElementById('new-desc').value.trim();
  const price    = parseFloat(document.getElementById('new-price').value);
  const category = document.getElementById('new-category').value;
  const seller   = localStorage.getItem('session-user') || 'anonymous';

  if (!title || !desc || isNaN(price) || !category) {
    alert('Please fill in all fields correctly.');
    return;
  }

  const products = JSON.parse(localStorage.getItem('products')) || [];
  const newProduct = {
    id: Date.now(),
    title,
    description: desc,
    price,
    category,
    seller
  };

  products.push(newProduct);
  localStorage.setItem('products', JSON.stringify(products));
  renderProducts();
  document.getElementById('add-product-form').reset();
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

function renderReviews() {
  const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
  const params  = new URLSearchParams(window.location.search);
  const urlReview = params.get('review');

  const container = document.getElementById('reviews-container');
  container.innerHTML = '';

  if (urlReview) {
    const preview = document.createElement('div');
    preview.className = 'review-item';
    preview.innerHTML = `<strong>Preview:</strong>${urlReview}`;
    container.appendChild(preview);
  }

  reviews.forEach(review => {  
  const el = document.createElement('div');  
  el.className = 'review-item';  

  const strong = document.createElement('strong');  
  strong.textContent = review.reviewer;  
  
  const text = document.createTextNode(' ' + review.text);  
  el.append(strong, text);  
  container.appendChild(el);  
});
}

function submitReview(event) {
  event.preventDefault();
  const reviews   = JSON.parse(localStorage.getItem('reviews')) || [];
  const reviewer  = document.getElementById('reviewer-name').value;
  const text      = document.getElementById('review-text').value;
  const productId = parseInt(document.getElementById('review-product-id').value, 10);

  reviews.push({
    id: Date.now(),
    productId,
    reviewer,
    text,
    rating: 5
  });

  localStorage.setItem('reviews', JSON.stringify(reviews));
  renderReviews();
  document.getElementById('add-review-form').reset();
}

// ---------------------------------------------------------------------------
// Shopping Cart
// ---------------------------------------------------------------------------

function addToCart(btn) {
  const cart  = JSON.parse(localStorage.getItem('cart')) || [];
  const price = parseFloat(btn.getAttribute('data-price'));
  const title = btn.getAttribute('data-title');
  const id    = parseInt(btn.getAttribute('data-id'), 10);

  cart.push({ id, title, price });
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const cart      = JSON.parse(localStorage.getItem('cart')) || [];
  const container = document.getElementById('cart-items');
  const totalEl   = document.getElementById('cart-total');
  container.innerHTML = '';

  let total = 0;
  cart.forEach((item, index) => {
    total += item.price;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <span>${item.title}</span>
      <span data-price="${item.price}">₹${item.price}</span>
      <button onclick="removeFromCart(${index})">Remove</button>
    `;
    container.appendChild(div);
  });

  totalEl.textContent = total.toFixed(2);
}

function removeFromCart(index) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

function checkout() {
  const cartItems = document.querySelectorAll('#cart-items .cart-item');
  let total = 0;

  cartItems.forEach(item => {
    const priceEl = item.querySelector('[data-price]');
    total += parseFloat(priceEl.getAttribute('data-price'));
  });

  alert(`Order placed! Total charged: ₹${total.toFixed(2)}`);
  localStorage.setItem('cart', JSON.stringify([]));
  renderCart();
}

// ---------------------------------------------------------------------------
// Admin Actions
// ---------------------------------------------------------------------------

function deleteAllListings() {
  const user = localStorage.getItem('session-user');

  if (user !== 'admin') {
    alert("Unauthorized");
    return;
  }

  if (confirm('Are you sure?')) {
    localStorage.setItem('products', JSON.stringify([]));
    renderProducts();
  }
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  initData();
  renderProducts();
  renderReviews();
  renderCart();
  applyRoleBasedUI();
});
