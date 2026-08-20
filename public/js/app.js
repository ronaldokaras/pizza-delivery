let cart = JSON.parse(localStorage.getItem('cart')) || [];
const token = localStorage.getItem('token');
let allPizzas = [];

function updateNav() {
  const loginLink = document.getElementById('loginLink');
  const registerLink = document.getElementById('registerLink');
  const userLink = document.getElementById('userLink');
  const adminLink = document.getElementById('adminLink');
  const logoutLink = document.getElementById('logoutLink');

  if (token) {
    loginLink.classList.add('hidden');
    registerLink.classList.add('hidden');
    userLink.classList.remove('hidden');
    logoutLink.classList.remove('hidden');
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role === 'admin') adminLink.classList.remove('hidden');
  }
}

async function loadPizzas() {
  try {
    const res = await fetch('/api/menu');
    allPizzas = await res.json();
    renderPizzas(allPizzas);
  } catch (err) {
    showToast('Erro ao carregar pizzas', 'error');
  }
}

function renderPizzas(pizzas) {
  const grid = document.getElementById('pizzaGrid');
  grid.innerHTML = pizzas.map(pizza => `
    <div class="pizza-card">
      <img src="${pizza.image_url || 'https://via.placeholder.com/300x180?text=Pizza'}" alt="${pizza.name}">
      <div class="pizza-info">
        <h3>${pizza.name}</h3>
        <p>${pizza.description || ''}</p>
        <p class="price">R$ ${pizza.price.toFixed(2)}</p>
        <button class="btn" onclick="addToCart(${pizza.id}, '${pizza.name}', ${pizza.price})">Adicionar</button>
      </div>
    </div>
  `).join('');
}

function filterPizzas() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allPizzas.filter(p =>
    p.name.toLowerCase().includes(search) ||
    (p.description && p.description.toLowerCase().includes(search))
  );
  renderPizzas(filtered);
}

function addToCart(id, name, price) {
  const existing = cart.find(item => item.pizza_id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ pizza_id: id, name, price, quantity: 1 });
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.pizza_id !== id);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.pizza_id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) cart = cart.filter(i => i.pizza_id !== id);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const cartEmpty = document.getElementById('cartEmpty');
  const checkoutBtn = document.getElementById('checkoutBtn');

  if (cart.length === 0) {
    cartItems.innerHTML = '';
    cartTotal.textContent = 'Total: R$ 0,00';
    cartEmpty.style.display = 'block';
    checkoutBtn.style.display = 'none';
    return;
  }
  cartEmpty.style.display = 'none';
  checkoutBtn.style.display = 'block';

  cartItems.innerHTML = cart.map(item => `
    <li class="cart-item">
      <span>${item.name}</span>
      <div class="qty-controls">
        <button onclick="changeQty(${item.pizza_id}, -1)">−</button>
        <span>${item.quantity}</span>
        <button onclick="changeQty(${item.pizza_id}, 1)">+</button>
      </div>
      <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
      <button onclick="removeFromCart(${item.pizza_id})">🗑️</button>
    </li>
  `).join('');

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartTotal.textContent = `Total: R$ ${total.toFixed(2)}`;
}

function openPaymentModal() {
  if (!token) {
    showToast('Você precisa estar logado para fazer um pedido.', 'warning');
    window.location.href = 'login.html';
    return;
  }
  if (cart.length === 0) return;
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  document.getElementById('paymentTotal').textContent = `Total: R$ ${total.toFixed(2)}`;

  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    document.getElementById('deliveryAddress').value = user.address || '';
    document.getElementById('contactEmail').value = user.email || '';
  } else {
    document.getElementById('deliveryAddress').value = '';
    document.getElementById('contactEmail').value = '';
  }
  document.getElementById('paymentModal').classList.remove('hidden');
}

function closePaymentModal() {
  document.getElementById('paymentModal').classList.add('hidden');
}

async function confirmPayment() {
  const method = document.getElementById('paymentMethod').value;
  const deliveryAddress = document.getElementById('deliveryAddress').value.trim();
  const contactEmail = document.getElementById('contactEmail').value.trim();
  if (!deliveryAddress) {
    showToast('Informe o endereço de entrega', 'error');
    return;
  }
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        items: cart,
        total: total,
        payment_method: method,
        delivery_address: deliveryAddress,
        contact_email: contactEmail || null
      })
    });
    if (res.ok) {
      showToast('Pedido realizado com sucesso!', 'success');
      cart = [];
      localStorage.setItem('cart', JSON.stringify(cart));
      renderCart();
      closePaymentModal();
    } else {
      const error = await res.json();
      showToast(error.error || 'Erro ao fazer pedido', 'error');
    }
  } catch (err) {
    showToast('Erro de conexão', 'error');
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('cart');
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  updateNav();
  loadPizzas();
  renderCart();
  document.getElementById('checkoutBtn').addEventListener('click', openPaymentModal);
  document.getElementById('logoutLink').addEventListener('click', logout);
});