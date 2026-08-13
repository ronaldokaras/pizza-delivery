require('dotenv').config(); // Carrega variáveis do arquivo .env

const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool, initDB } = require('./db');
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const { authenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// Rota protegida (teste)
app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: 'Acesso autorizado', user: req.user });
});

// Fallback para o frontend (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicializa o banco e depois sobe o servidor
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Erro ao inicializar banco de dados:', err);
    process.exit(1);
  });