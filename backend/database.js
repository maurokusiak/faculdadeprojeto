const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conecta ao banco de dados (ou cria o arquivo `database.sqlite` se não existir)
const db = new sqlite3.Database(
  path.join(__dirname, 'database.sqlite'),
  (err) => {
    if (err) {
      console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
      console.log('Conectado ao banco de dados SQLite.');
    }
  }
);

// Cria as tabelas para produtos, pedidos e avaliações se não existirem
db.serialize(() => {
  db.run(`
        CREATE TABLE IF NOT EXISTS produtos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            preco REAL NOT NULL,
            categoria TEXT,
            imagem TEXT
        )
    `);

  db.run(`
        CREATE TABLE IF NOT EXISTS pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT,
            total REAL
        )
    `);

  db.run(`
        CREATE TABLE IF NOT EXISTS pedido_itens (
            pedido_id INTEGER,
            produto_id INTEGER,
            quantidade INTEGER,
            FOREIGN KEY(pedido_id) REFERENCES pedidos(id),
            FOREIGN KEY(produto_id) REFERENCES produtos(id)
        )
    `);

  db.run(`
        CREATE TABLE IF NOT EXISTS avaliacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            produto_id INTEGER,
            nota INTEGER,
            comentario TEXT,
            FOREIGN KEY(produto_id) REFERENCES produtos(id)
        )
    `);
});

module.exports = db;
