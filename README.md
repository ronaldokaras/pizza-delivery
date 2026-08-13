# 🍕 Pizzaria Delícia - Sistema de Pedidos

Sistema web completo para pizzaria com área do cliente, painel administrativo e API REST.

## Funcionalidades

- **Cardápio público**: visualização de pizzas com imagem, descrição e preço.
- **Autenticação**: registro e login com JWT.
- **Carrinho de compras**: adicionar, remover e finalizar pedido.
- **Histórico de pedidos**: usuário vê seus pedidos e status.
- **Painel admin**: CRUD de pizzas, listagem de todos os pedidos e atualização de status.
- **Persistência**: banco de dados SQLite (com seed automático).

## Tecnologias

- **Backend**: Node.js, Express, SQLite (better-sqlite3), JWT, bcryptjs.
- **Frontend**: HTML, CSS, JavaScript puro (sem frameworks).
- **Deploy**: pronto para Render, Netlify, Vercel, etc.

## Como rodar localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/pizza-delivery.git
   cd pizza-delivery