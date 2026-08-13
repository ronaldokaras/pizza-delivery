const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

let pizzas = [];
let orders = [];

// Verificar se é admin
function checkAdmin() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || user.role !== 'admin') {
    alert('Acesso restrito');
    window.location.href = 'index.html';
  }
}

// Carregar pizzas
async function loadPizzas() {
  try {
    const res = await fetch('/api/menu');
    pizzas = await res.json();
    renderPizzaTable();
  } catch (err) {
    console.error('Erro ao carregar pizzas:', err);
  }
}

// Carregar pedidos
async function loadOrders() {
  try {
    const res = await fetch('/api/orders/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    orders = await res.json();
    renderOrdersTable();
  } catch (err) {
    console.error('Erro ao carregar pedidos:', err);
  }
}

// Renderizar tabela de pizzas
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

// Renderizar tabela de pedidos
function renderOrdersTable() {
  const tbody = document.querySelector('#ordersTable tbody');
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td>${o.id}</td>
      <td>${o.user_name} (${o.user_email})</td>
      <td>${o.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</td>
      <td>R$ ${o.total.toFixed(2)}</td>
      <td><span class="status-badge status-${o.status}">${o.status}</span></td>
      <td>${new Date(o.created_at).toLocaleString('pt-BR')}</td>
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

// Adicionar pizza
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
      alert('Pizza adicionada!');
      document.getElementById('pizzaForm').reset();
      loadPizzas();
    } else {
      const data = await res.json();
      alert(data.error || 'Erro ao adicionar');
    }
  } catch (err) {
    alert('Erro de conexão');
  }
}

// Excluir pizza
async function deletePizza(id) {
  if (!confirm('Excluir esta pizza?')) return;
  try {
    const res = await fetch(`/api/menu/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      alert('Pizza excluída');
      loadPizzas();
    }
  } catch (err) {
    alert('Erro de conexão');
  }
}

// Editar pizza (simples: prompt para novos valores)
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
      alert('Pizza atualizada');
      loadPizzas();
    }
  } catch (err) {
    alert('Erro de conexão');
  }
}

// Atualizar status do pedido
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
      alert('Status atualizado');
      loadOrders();
    } else {
      const data = await res.json();
      alert(data.error || 'Erro');
    }
  } catch (err) {
    alert('Erro de conexão');
  }
}

// Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  checkAdmin();
  loadPizzas();
  loadOrders();
  document.getElementById('pizzaForm').addEventListener('submit', addPizza);
  document.getElementById('logoutLink').addEventListener('click', logout);
});