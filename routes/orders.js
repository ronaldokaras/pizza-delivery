const express = require('express');
const { pool } = require('../db');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const router = express.Router();

// POST /api/orders
router.post('/', authenticate, async (req, res) => {
  const { items, total, payment_method, delivery_address, contact_email } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Pedido vazio' });
  }
  if (!delivery_address) {
    return res.status(400).json({ error: 'Endereço de entrega é obrigatório' });
  }

  const itemsJson = JSON.stringify(items);
  try {
    const result = await pool.query(
      'INSERT INTO orders (user_id, items, total, payment_method, delivery_address, contact_email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, itemsJson, total, payment_method || null, delivery_address, contact_email || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// GET /api/orders/my
router.get('/my', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    const orders = result.rows.map(order => {
      order.items = JSON.parse(order.items);
      return order;
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// GET /api/orders/all
router.get('/all', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, u.name as user_name, u.email as user_email, u.address as user_address
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    const orders = result.rows.map(order => {
      order.items = JSON.parse(order.items);
      return order;
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// PUT /api/orders/:id/status
router.put('/:id/status', authenticate, authorizeAdmin, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'preparing', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }

  const orderId = parseInt(req.params.id);
  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, orderId]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Pedido não encontrado' });
    const order = result.rows[0];
    order.items = JSON.parse(order.items);
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

module.exports = router;