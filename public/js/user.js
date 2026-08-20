const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

async function loadOrders() {
  try {
    const res = await fetch('/api/orders/my', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const orders = await res.json();
    const container = document.getElementById('ordersList');
    if (orders.length === 0) {
      container.innerHTML = '<p style="color: var(--muted);">Nenhum pedido realizado.</p>';
      return;
    }
    container.innerHTML = orders.map(order => `
      <div class="card">
        <p><strong>Pedido #${order.id}</strong> - ${new Date(order.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
        <p>Status: <span class="status-badge status-${order.status}">${order.status}</span></p>
        <p>Pagamento: ${order.payment_method || 'Não informado'}</p>
        <p>Endereço de entrega: ${order.delivery_address || 'N/A'}</p>
        <ul>
          ${order.items.map(item => `<li>${item.name} x${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}</li>`).join('')}
        </ul>
        <p><strong>Total: R$ ${order.total.toFixed(2)}</strong></p>
      </div>
    `).join('');
  } catch (err) {
    showToast('Erro ao carregar pedidos', 'error');
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('cart');
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  loadOrders();
  document.getElementById('logoutLink').addEventListener('click', logout);
});