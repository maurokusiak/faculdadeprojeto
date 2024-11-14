const API_URL = 'http://localhost:3000/api';

let carrinho = [];
let custoEntrega = 0;
let produtos = [];

// Função de Notificação
function mostrarNotificacao(mensagem) {
  const notificacao = document.getElementById('notificacao');
  notificacao.textContent = mensagem;
  notificacao.style.display = 'block';
  setTimeout(() => {
    notificacao.style.display = 'none';
  }, 3000);
}

// Carregar produtos do servidor
async function carregarProdutos() {
  try {
    const response = await fetch(`${API_URL}/produtos`);
    produtos = await response.json();
    exibirCupcakes();
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    mostrarNotificacao('Erro ao carregar produtos.');
  }
}

// Exibir cupcakes com avaliações e imagens
async function exibirCupcakes(categoria = 'todos') {
  const cupcakesList = document.querySelector('.cupcakes-list');
  cupcakesList.innerHTML = '';
  for (const cupcake of produtos) {
    if (categoria === 'todos' || cupcake.categoria === categoria) {
      const avaliacoesHtml = await carregarAvaliacoes(cupcake.id);
      const cupcakeDiv = document.createElement('div');
      cupcakeDiv.classList.add('cupcake');
      cupcakeDiv.innerHTML = `
                <img src="${cupcake.imagem}" alt="${cupcake.nome}">
                <h3>${cupcake.nome}</h3>
                <p>R$ ${cupcake.preco.toFixed(2)}</p>
                <button onclick="adicionarAoCarrinho(${
                  cupcake.id
                })">Adicionar ao Carrinho</button>
                <button onclick="abrirModal(${cupcake.id})">Avaliar</button>
                <div class="avaliacoes">${avaliacoesHtml}</div>
            `;
      cupcakesList.appendChild(cupcakeDiv);
    }
  }
}

// Função para carregar avaliações
async function carregarAvaliacoes(id) {
  try {
    const response = await fetch(`${API_URL}/avaliacoes/${id}`);
    const produtoAvaliacoes = await response.json();
    return produtoAvaliacoes.length > 0
      ? produtoAvaliacoes
          .map((a) => `<p>Nota: ${a.nota} - ${a.comentario}</p>`)
          .join('')
      : 'Sem avaliações.';
  } catch (error) {
    console.error('Erro ao carregar avaliações:', error);
    return 'Erro ao carregar avaliações.';
  }
}

// Adicionar ao carrinho
function adicionarAoCarrinho(id) {
  const cupcake = produtos.find((c) => c.id === id);
  const itemNoCarrinho = carrinho.find((item) => item.id === id);
  if (itemNoCarrinho) {
    itemNoCarrinho.quantidade += 1;
  } else {
    carrinho.push({ ...cupcake, quantidade: 1 });
  }
  atualizarCarrinho();
  mostrarNotificacao('Item adicionado ao carrinho!');
}

// Atualizar carrinho com custo de entrega
function atualizarCarrinho() {
  const carrinhoLista = document.getElementById('carrinho-lista');
  carrinhoLista.innerHTML = '';
  let total = custoEntrega;
  carrinho.forEach((item) => {
    total += item.preco * item.quantidade;
    const itemCarrinho = document.createElement('li');
    itemCarrinho.innerHTML = `
            ${item.nome} - R$ ${item.preco.toFixed(2)} x 
            <button onclick="alterarQuantidade(${item.id}, -1)">-</button>
            ${item.quantidade}
            <button onclick="alterarQuantidade(${item.id}, 1)">+</button>
            = R$ ${(item.preco * item.quantidade).toFixed(2)}
        `;
    carrinhoLista.appendChild(itemCarrinho);
  });

  const totalDiv = document.createElement('div');
  totalDiv.textContent = `Total: R$ ${total.toFixed(2)} (incluindo entrega)`;
  carrinhoLista.appendChild(totalDiv);
}

// Alterar quantidade no carrinho
function alterarQuantidade(id, change) {
  const item = carrinho.find((item) => item.id === id);
  if (item) {
    item.quantidade += change;
    if (item.quantidade <= 0) {
      const index = carrinho.indexOf(item);
      carrinho.splice(index, 1);
    }
    atualizarCarrinho();
    mostrarNotificacao('Quantidade atualizada!');
  }
}

// Inicialização
carregarProdutos();
