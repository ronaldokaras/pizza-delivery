function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) {
    const div = document.createElement('div');
    div.id = 'toast-container';
    div.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 9999;
      display: flex; flex-direction: column; gap: 10px;
    `;
    document.body.appendChild(div);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    padding: 12px 20px; border-radius: 6px; color: white;
    font-weight: 500; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    animation: slideIn 0.3s ease;
  `;
  const colors = {
    success: '#2ecc71',
    error: '#e74c3c',
    warning: '#f39c12',
    info: '#3498db'
  };
  toast.style.backgroundColor = colors[type] || colors.info;
  document.getElementById('toast-container').appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Adicionar estilos de animação
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
  @keyframes slideOut { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(100%); } }
`;
document.head.appendChild(style);