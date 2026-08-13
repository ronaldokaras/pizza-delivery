const express = require('express');
const { pool } = require('../db');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/menu (pública)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pizzas ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// POST /api/menu (admin)
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  const { name, description, price, image_url } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO pizzas (name, description, price, image_url, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, price, image_url, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// PUT /api/menu/:id (admin)
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  const { name, description, price, image_url } = req.body;
  const pizzaId = parseInt(req.params.id);

  try {
    const existing = await pool.query('SELECT * FROM pizzas WHERE id = $1', [pizzaId]);
    if (existing.rowCount === 0) return res.status(404).json({ error: 'Pizza não encontrada' });

    const pizza = existing.rows[0];
    const updatedName = name || pizza.name;
    const updatedDescription = description !== undefined ? description : pizza.description;
    const updatedPrice = price || pizza.price;
    const updatedImage = image_url !== undefined ? image_url : pizza.image_url;

    const result = await pool.query(
      'UPDATE pizzas SET name = $1, description = $2, price = $3, image_url = $4 WHERE id = $5 RETURNING *',
      [updatedName, updatedDescription, updatedPrice, updatedImage, pizzaId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// DELETE /api/menu/:id (admin)
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  const pizzaId = parseInt(req.params.id);
  try {
    const result = await pool.query('DELETE FROM pizzas WHERE id = $1', [pizzaId]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Pizza não encontrada' });
    res.json({ message: 'Pizza removida' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

module.exports = router;