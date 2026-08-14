const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

let pizzas = [];
let orders = [];
let lastOrderId = 0;

function checkAdmin() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || user.role !== 'admin') {
    showToast('Acesso restrito', 'error');
    window.location.href = 'index.html';
  }
}

async function loadPizzas() {
  try {
    const res = await fetch('/api/menu');
    pizzas = await res.json();
    renderPizzaTable();
  } catch (err) {
    showToast('Erro ao carregar pizzas', 'error');
  }
}

async function loadOrders() {
  try {
    const res = await fetch('/api/orders/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    orders = await res.json();
    renderOrdersTable();
  } catch (err) {
    showToast('Erro ao carregar pedidos', 'error');
  }
}

function renderPizzaTable() {
  const tbody = document.querySelector('#pizzaTable tbody');
  tbody.innerHTML = pizzas.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>R$ ${p.price.toFixed(2)}</td>
      <td>
        <button class="btn btn-outline" onclick="editPizza(${p.id})">Editar</button>
        <button class="btn" onclick="deletePizza(${p.id})">Excluir</button>
      </td>
    </tr>
  `).join('');
}

function renderOrdersTable() {
  const tbody = document.querySelector('#ordersTable tbody');
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td>${o.id}</td>
      <td>${o.user_name} (${o.user_email})</td>
      <td>${o.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</td>
      <td>R$ ${o.total.toFixed(2)}</td>
      <td><span class="status-badge status-${o.status}">${o.status}</span></td>
      <td>${new Date(o.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</td>
      <td>
        <select onchange="updateOrderStatus(${o.id}, this.value)">
          <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pendente</option>
          <option value="preparing" ${o.status === 'preparing' ? 'selected' : ''}>Preparando</option>
          <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Entregue</option>
          <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelado</option>
        </select>
      </td>
    </tr>
  `).join('');
}

async function addPizza(e) {
  e.preventDefault();
  const name = document.getElementById('pizzaName').value;
  const description = document.getElementById('pizzaDescription').value;
  const price = parseFloat(document.getElementById('pizzaPrice').value);
  const image_url = document.getElementById('pizzaImage').value;

  try {
    const res = await fetch('/api/menu', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, description, price, image_url })
    });
    if (res.ok) {
      showToast('Pizza adicionada!', 'success');
      document.getElementById('pizzaForm').reset();
      loadPizzas();
    } else {
      const data = await res.json();
      showToast(data.error || 'Erro ao adicionar', 'error');
    }
  } catch (err) {
    showToast('Erro de conexão', 'error');
  }
}

async function deletePizza(id) {
  if (!confirm('Excluir esta pizza?')) return;
  try {
    const res = await fetch(`/api/menu/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      showToast('Pizza excluída', 'success');
      loadPizzas();
    }
  } catch (err) {
    showToast('Erro de conexão', 'error');
  }
}

async function editPizza(id) {
  const pizza = pizzas.find(p => p.id === id);
  const name = prompt('Nome:', pizza.name);
  const description = prompt('Descrição:', pizza.description);
  const price = prompt('Preço:', pizza.price);
  const image_url = prompt('URL da imagem:', pizza.image_url || '');

  if (!name || !price) return;

  try {
    const res = await fetch(`/api/menu/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, description, price: parseFloat(price), image_url })
    });
    if (res.ok) {
      showToast('Pizza atualizada', 'success');
      loadPizzas();
    }
  } catch (err) {
    showToast('Erro de conexão', 'error');
  }
}

async function updateOrderStatus(orderId, status) {
  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      showToast('Status atualizado', 'success');
      loadOrders();
    } else {
      const data = await res.json();
      showToast(data.error || 'Erro', 'error');
    }
  } catch (err) {
    showToast('Erro de conexão', 'error');
  }
}

// Polling para novos pedidos
async function checkNewOrders() {
  try {
    const res = await fetch('/api/orders/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const newOrders = await res.json();
    if (newOrders.length > 0 && newOrders[0].id > lastOrderId) {
      showToast(`🛒 Novo pedido #${newOrders[0].id} recebido!`, 'warning', 5000);
      lastOrderId = newOrders[0].id;
      loadOrders();
    }
  } catch (err) {
    console.error('Erro ao verificar novos pedidos:', err);
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('cart');
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  checkAdmin();
  loadPizzas();
  loadOrders().then(() => {
    if (orders.length > 0) lastOrderId = orders[0].id;
  });
  document.getElementById('pizzaForm').addEventListener('submit', addPizza);
  document.getElementById('logoutLink').addEventListener('click', logout);
  setInterval(checkNewOrders, 10000); // a cada 10s
});