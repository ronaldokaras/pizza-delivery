let cart = JSON.parse(localStorage.getItem('cart')) || [];
const token = localStorage.getItem('token');

// Atualizar navegação conforme login
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

    // Se for admin, mostra link admin
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role === 'admin') {
      adminLink.classList.remove('hidden');
    }
  }
}

// Carregar pizzas
async function loadPizzas() {
  try {
    const res = await fetch('/api/menu');
    const pizzas = await res.json();
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
  } catch (err) {
    console.error('Erro ao carregar pizzas:', err);
  }
}

// Adicionar ao carrinho
function addToCart(id, name, price) {
  const existing = cart.find(item => item.pizza_id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ pizza_id: id, name, price, quantity: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

// Remover do carrinho
function removeFromCart(id) {
  cart = cart.filter(item => item.pizza_id !== id);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

// Renderizar carrinho
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
      <span>${item.name} x${item.quantity}</span>
      <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
      <button onclick="removeFromCart(${item.pizza_id})">🗑️</button>
    </li>
  `).join('');

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartTotal.textContent = `Total: R$ ${total.toFixed(2)}`;
}

// Finalizar pedido
async function checkout() {
  if (!token) {
    alert('Você precisa estar logado para fazer um pedido.');
    window.location.href = 'login.html';
    return;
  }
  if (cart.length === 0) return;

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
        total: total
      })
    });

    if (res.ok) {
      alert('Pedido realizado com sucesso!');
      cart = [];
      localStorage.setItem('cart', JSON.stringify(cart));
      renderCart();
    } else {
      const error = await res.json();
      alert(error.error || 'Erro ao fazer pedido');
    }
  } catch (err) {
    console.error('Erro:', err);
    alert('Erro ao conectar com o servidor');
  }
}

// Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  updateNav();
  loadPizzas();
  renderCart();
  document.getElementById('checkoutBtn').addEventListener('click', checkout);
  document.getElementById('logoutLink').addEventListener('click', logout);
});