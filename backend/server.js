const express = require('express');
const path = require('path');
const db = require('./database');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// Rota para obter produtos
app.get('/api/produtos', (req, res) => {
  db.all('SELECT * FROM produtos', (err, rows) => {
    if (err) {
      console.error('Erro ao buscar produtos:', err.message);
      res.status(500).json({ error: 'Erro ao buscar produtos' });
    } else {
      res.json(rows);
    }
  });
});

// Rota para adicionar um pedido
app.post('/api/pedidos', (req, res) => {
  const { itens, total } = req.body;
  const data = new Date().toLocaleDateString();

  db.run(
    'INSERT INTO pedidos (data, total) VALUES (?, ?)',
    [data, total],
    function (err) {
      if (err) {
        console.error('Erro ao criar pedido:', err.message);
        res.status(500).json({ error: 'Erro ao criar pedido' });
      } else {
        const pedidoId = this.lastID;
        const stmt = db.prepare(
          'INSERT INTO pedido_itens (pedido_id, produto_id, quantidade) VALUES (?, ?, ?)'
        );

        itens.forEach((item) => {
          stmt.run(pedidoId, item.id, item.quantidade);
        });

        stmt.finalize();
        res
          .status(201)
          .json({ message: 'Pedido criado com sucesso', pedidoId });
      }
    }
  );
});

// Rota para obter histórico de pedidos
app.get('/api/pedidos', (req, res) => {
  db.all(
    `
        SELECT pedidos.id, pedidos.data, pedidos.total, GROUP_CONCAT(produtos.nome || ' x ' || pedido_itens.quantidade, ', ') AS itens
        FROM pedidos
        JOIN pedido_itens ON pedidos.id = pedido_itens.pedido_id
        JOIN produtos ON pedido_itens.produto_id = produtos.id
        GROUP BY pedidos.id
    `,
    (err, rows) => {
      if (err) {
        console.error('Erro ao buscar pedidos:', err.message);
        res.status(500).json({ error: 'Erro ao buscar pedidos' });
      } else {
        res.json(rows);
      }
    }
  );
});

// Rota para adicionar uma avaliação
app.post('/api/avaliacoes/:id', (req, res) => {
  const produtoId = parseInt(req.params.id);
  const { nota, comentario } = req.body;

  db.run(
    'INSERT INTO avaliacoes (produto_id, nota, comentario) VALUES (?, ?, ?)',
    [produtoId, nota, comentario],
    function (err) {
      if (err) {
        console.error('Erro ao adicionar avaliação:', err.message);
        res.status(500).json({ error: 'Erro ao adicionar avaliação' });
      } else {
        res.status(201).json({ message: 'Avaliação adicionada com sucesso' });
      }
    }
  );
});

// Rota para obter avaliações de um produto
app.get('/api/avaliacoes/:id', (req, res) => {
  const produtoId = parseInt(req.params.id);

  db.all(
    'SELECT * FROM avaliacoes WHERE produto_id = ?',
    [produtoId],
    (err, rows) => {
      if (err) {
        console.error('Erro ao buscar avaliações:', err.message);
        res.status(500).json({ error: 'Erro ao buscar avaliações' });
      } else {
        res.json(rows);
      }
    }
  );
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// Rota temporária para popular produtos
// app.get('/api/popular-produtos', (req, res) => {
//   const produtos = [
//     {
//       nome: 'Cupcake de Chocolate',
//       preco: 5.0,
//       categoria: 'chocolate',
//       imagem: '/images/chocolate.jpg',
//     },
//     {
//       nome: 'Cupcake de Morango',
//       preco: 5.5,
//       categoria: 'frutas',
//       imagem: '/images/morango.jpg',
//     },
//     {
//       nome: 'Cupcake de Limão',
//       preco: 4.5,
//       categoria: 'frutas',
//       imagem: '/images/limao.jpg',
//     },
//     {
//       nome: 'Cupcake de Baunilha',
//       preco: 4.75,
//       categoria: 'baunilha',
//       imagem: '/images/baunilha.jpg',
//     },
//   ];

//   const stmt = db.prepare(
//     'INSERT INTO produtos (nome, preco, categoria, imagem) VALUES (?, ?, ?, ?)'
//   );
//   produtos.forEach((produto) => {
//     stmt.run(produto.nome, produto.preco, produto.categoria, produto.imagem);
//   });
//   stmt.finalize();

//   res.send('Produtos inseridos com sucesso!');
// });

// Rota temporária para limpar e repopular a tabela de produtos
// app.get('/api/resetar-produtos', (req, res) => {
//   db.run('DELETE FROM produtos', (err) => {
//     if (err) {
//       console.error('Erro ao limpar produtos:', err.message);
//       res.status(500).json({ error: 'Erro ao limpar produtos' });
//     } else {
//       const produtos = [
//         {
//           nome: 'Cupcake de Chocolate',
//           preco: 5.0,
//           categoria: 'chocolate',
//           imagem: '/images/chocolate.jpg',
//         },
//         {
//           nome: 'Cupcake de Morango',
//           preco: 5.5,
//           categoria: 'frutas',
//           imagem: '/images/morango.jpg',
//         },
//         {
//           nome: 'Cupcake de Limão',
//           preco: 4.5,
//           categoria: 'frutas',
//           imagem: '/images/limao.jpg',
//         },
//         {
//           nome: 'Cupcake de Baunilha',
//           preco: 4.75,
//           categoria: 'baunilha',
//           imagem: '/images/baunilha.jpg',
//         },
//       ];

//       const stmt = db.prepare(
//         'INSERT INTO produtos (nome, preco, categoria, imagem) VALUES (?, ?, ?, ?)'
//       );
//       produtos.forEach((produto) => {
//         stmt.run(
//           produto.nome,
//           produto.preco,
//           produto.categoria,
//           produto.imagem
//         );
//       });
//       stmt.finalize();

//       res.send('Produtos foram redefinidos com sucesso!');
//     }
//   });
// });
