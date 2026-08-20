const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false
});

async function initDB() {
  const client = await pool.connect();
  try {
    // Criar tabelas se não existirem
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user'
      );

      CREATE TABLE IF NOT EXISTS pizzas (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image_url TEXT,
        created_by INTEGER REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        items TEXT NOT NULL,
        total REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        payment_method TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ✅ Garantir que a coluna payment_method exista (para bancos antigos)
    await client.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;');

    // Seed: usuário admin
    const adminExists = await client.query('SELECT id FROM users WHERE email = $1', ['admin@example.com']);
    if (adminExists.rowCount === 0) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      await client.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
        ['Administrador', 'admin@example.com', hashedPassword, 'admin']
      );
      console.log('✅ Usuário admin criado: admin@example.com / admin123');
    }

    // Seed: pizzas de exemplo
    const pizzaCount = await client.query('SELECT COUNT(*) FROM pizzas');
    if (parseInt(pizzaCount.rows[0].count) === 0) {
      const pizzas = [
        { name: 'Margherita', description: 'Molho de tomate, mussarela, manjericão fresco', price: 35.90, image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300' },
        { name: 'Calabresa', description: 'Molho de tomate, mussarela, calabresa fatiada, cebola', price: 39.90, image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300' },
        { name: 'Quatro Queijos', description: 'Mussarela, provolone, parmesão, gorgonzola', price: 42.90, image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300' },
        { name: 'Portuguesa', description: 'Molho de tomate, mussarela, presunto, ovos, cebola, ervilha', price: 44.90, image_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300' }
      ];
      for (const p of pizzas) {
        await client.query(
          'INSERT INTO pizzas (name, description, price, image_url) VALUES ($1, $2, $3, $4)',
          [p.name, p.description, p.price, p.image_url]
        );
      }
      console.log('🍕 Pizzas de exemplo criadas');
    }
  } finally {
    client.release();
  }
}

module.exports = { pool, initDB };