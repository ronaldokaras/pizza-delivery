# 🍕 Pizzaria Delícia - Sistema de Pedidos

[![Status](https://img.shields.io/badge/status-concluído-brightgreen?style=flat-square)]()
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

**Sistema web completo para pizzaria** – cardápio online, carrinho de compras, autenticação JWT, painel administrativo e gerenciamento de pedidos.

🔗 **Acesse a aplicação online:** [https://pizza-delivery-gm21.onrender.com](https://pizza-delivery-gm21.onrender.com)

---

## ✨ Funcionalidades

- 🍕 Cardápio público com imagem, descrição e preço.
- 🛒 Carrinho de compras (persistente no `localStorage`).
- 🔐 Autenticação JWT (registro e login).
- 📋 Área do usuário com histórico de pedidos.
- 🛠️ Painel administrativo: CRUD de pizzas e gerenciamento de pedidos.
- 💾 Banco de dados PostgreSQL com seed automático.
- 📱 Interface responsiva.

---

## 🛠️ Tecnologias

- **Backend:** Node.js, Express, PostgreSQL, JWT, bcryptjs.
- **Frontend:** HTML5, CSS3, JavaScript puro.
- **Infraestrutura:** Docker / Docker Compose.

---

## 🚀 Como rodar localmente com Docker

### Pré‑requisitos
- Docker Desktop instalado e em execução.

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/pizza-delivery.git
cd pizza-delivery
```

2. Inicie os containers:

```bash
docker-compose up --build
```
3. Aguarde as mensagens de seed e servidor iniciado.

4. Acesse `http://localhost:3000`.

### Comandos úteis

- Parar: `docker-compose down`
- Resetar banco: `docker-compose down -v`

---

## 🔑 Credenciais de Teste

| Tipo | E-mail | Senha |
|------|--------|-------|
| **Admin** | `admin@example.com` | `admin123` |
| **Usuário** | Cadastre‑se | — |

---

## 📁 Estrutura do Projeto

```bash
pizza-delivery/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── server.js
├── db.js
├── middleware/
│   └── auth.js
├── routes/
│   ├── auth.js
│   ├── menu.js
│   └── orders.js
└── public/
    ├── index.html
    ├── login.html
    ├── register.html
    ├── admin.html
    ├── user.html
    ├── css/
    │   └── styles.css
    └── js/
        ├── app.js
        ├── auth.js
        ├── admin.js
        └── user.js
```

---

## 📡 Endpoints da API

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| `POST` | `/api/auth/register` | Registrar | Não |
| `POST` | `/api/auth/login` | Login | Não |
| `GET` | `/api/auth/me` | Dados do usuário | Sim |
| `GET` | `/api/menu` | Listar pizzas | Não |
| `POST` | `/api/menu` | Criar pizza | Admin |
| `PUT` | `/api/menu/:id` | Atualizar pizza | Admin |
| `DELETE` | `/api/menu/:id` | Excluir pizza | Admin |
| `POST` | `/api/orders` | Criar pedido | Usuário |
| `GET` | `/api/orders/my` | Meus pedidos | Usuário |
| `GET` | `/api/orders/all` | Todos os pedidos | Admin |
| `PUT` | `/api/orders/:id/status` | Atualizar status | Admin |

---

## 📄 Licença

Projeto livre para fins educacionais.

---

Feito com ❤️ e muito queijo 🧀.
```