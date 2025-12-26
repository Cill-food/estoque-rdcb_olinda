import { db } from "./firebase-config.js";
import {
  ref,
  push,
  onValue,
  update,
  remove,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

// --- CONTROLE SIDEBAR ---
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebar-overlay");
const btnMenu = document.getElementById("btn-menu-mobile");
const btnCloseSidebar = document.getElementById("btn-close-sidebar");

const toggleSidebar = () => {
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
};
btnMenu.onclick = toggleSidebar;
btnCloseSidebar.onclick = toggleSidebar;
overlay.onclick = toggleSidebar;

// --- MONITOR CONEXÃO ---
const monitorConexao = () => {
  const statusRef = ref(db, ".info/connected");
  const divStatus = document.getElementById("status-conexao");
  const textoStatus = document.getElementById("texto-status");
  onValue(statusRef, (snap) => {
    if (snap.val() === true) {
      divStatus.classList.remove("offline");
      textoStatus.innerText = "Sistema Online";
    } else {
      divStatus.classList.add("offline");
      textoStatus.innerText = "Limite Diário ou Offline";
    }
  });
};
monitorConexao();

// --- CONTROLE MODAL ---
const modal = document.getElementById("modal-produto");
const btnAbrir = document.getElementById("btn-abrir-modal");
const btnFechar = document.getElementById("btn-fechar-modal");
const btnCancelar = document.getElementById("btn-cancelar");
btnAbrir.onclick = () => {
  carregarCategorias();
  modal.style.display = "flex";
};
const fechar = () => (modal.style.display = "none");
btnFechar.onclick = btnCancelar.onclick = fechar;

// --- LÓGICA CATEGORIAS NO MODAL ---
const selectEscolha = document.getElementById("select-categoria-escolha");
const grupoExistente = document.getElementById("grupo-categoria-existente");
const grupoNova = document.getElementById("grupo-categoria-nova");

selectEscolha.onchange = () => {
  const isNova = selectEscolha.value === "nova";
  grupoExistente.style.display = isNova ? "none" : "block";
  grupoNova.style.display = isNova ? "block" : "none";
};

function carregarCategorias() {
  onValue(
    ref(db, "produtos"),
    (snap) => {
      const select = document.getElementById("categoria-lista");
      select.innerHTML = "";
      const dados = snap.val();
      if (!dados)
        return (select.innerHTML =
          '<option value="">Crie uma categoria</option>');
      Object.keys(dados).forEach((cat) => {
        if (typeof dados[cat] === "object" && !dados[cat].nome) {
          const opt = document.createElement("option");
          opt.value = cat;
          opt.textContent = cat.replace(/_/g, " ").toUpperCase();
          select.appendChild(opt);
        }
      });
    },
    { onlyOnce: true }
  );
}

// --- SALVAR PRODUTO ---
document.getElementById("form-produto").onsubmit = (e) => {
  e.preventDefault();
  let cat = "";
  if (selectEscolha.value === "nova") {
    const nomeNova = document
      .getElementById("nova-categoria-nome")
      .value.trim();
    cat = nomeNova
      .toLowerCase()
      .replace(/\s+/g, "_")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  } else {
    cat = document.getElementById("categoria-lista").value;
  }
  if (!cat) return alert("Selecione uma categoria");

  const item = {
    nome: document.getElementById("nome-produto").value.trim(),
    quantidade: parseFloat(document.getElementById("qtd-produto").value) || 0,
    unidade: document.getElementById("unidade-produto").value,
    precoCusto: parseFloat(document.getElementById("custo-produto").value) || 0,
    precoVenda: parseFloat(document.getElementById("venda-produto").value) || 0,
    estoqueMinimo:
      parseFloat(document.getElementById("minimo-produto").value) || 0,
  };

  push(ref(db, `produtos/${cat}`), item)
    .then(() => {
      alert("Produto salvo!");
      e.target.reset();
      fechar();
    })
    .catch((err) => alert("Erro ao salvar: " + err.message));
};

// --- LISTAR ESTOQUE ---
onValue(ref(db, "produtos"), (snap) => {
  const lista = document.getElementById("lista-estoque");
  lista.innerHTML = "";
  const dados = snap.val();
  if (!dados) return (lista.innerHTML = "<p>Estoque vazio.</p>");

  Object.keys(dados).forEach((cat) => {
    if (typeof dados[cat] === "object" && !dados[cat].nome) {
      criarPasta(lista, cat, dados[cat], `produtos/${cat}`);
    }
  });
});

function criarPasta(container, nome, itens, pathBase) {
  const secao = document.createElement("div");
  secao.className = "categoria-container";

  // Nome limpo para exibição
  const nomeExibicao = nome.replace(/_/g, " ").toUpperCase();

  secao.innerHTML = `
        <div class="categoria-header">
            <h2><i class="fas fa-folder"></i> ${nomeExibicao}</h2>
            <div style="display: flex; gap: 10px; align-items: center;">
                <button class="btn-excluir-categoria" onclick="event.stopPropagation(); window.excluirCategoria('${pathBase}', '${nomeExibicao}')">
                    <i class="fas fa-trash"></i>
                </button>
                <i class="fas fa-chevron-down"></i>
            </div>
        </div>
        <div class="categoria-content"></div>
    `;
  const grid = secao.querySelector(".categoria-content");

  Object.keys(itens).forEach((id) => {
    const item = itens[id];
    const q = item.quantidade !== undefined ? item.quantidade : 0;
    const card = document.createElement("div");
    card.className = `card-produto ${
      q <= (item.estoqueMinimo || 0) ? "alerta" : ""
    }`;
    card.innerHTML = `
            <h3>${item.nome || "Item"}</h3>
            <p>Estoque: <strong>${q} ${item.unidade || ""}</strong></p>
            <p style="font-size:11px; color:#666;">Venda: R$ ${(
              item.precoVenda || 0
            ).toFixed(2)}</p>
            <div class="controles">
                <input type="number" id="val-${id}" class="input-qtd" placeholder="Qtd">
                <button class="btn-atualizar" onclick="window.atualizarEstoque('${pathBase}/${id}', '${id}')">OK</button>
                <button class="btn-excluir" onclick="window.excluirItem('${pathBase}/${id}', '${
      item.nome
    }')">Excluir</button>
            </div>`;
    grid.appendChild(card);
  });

  secao.querySelector(".categoria-header").onclick = (e) => {
    if (e.target.closest(".btn-excluir-categoria")) return;
    secao.classList.toggle("open");
  };
  container.appendChild(secao);
}

// --- FUNÇÕES GLOBAIS ---
window.atualizarEstoque = (caminho, id) => {
  const val = parseFloat(document.getElementById(`val-${id}`).value);
  if (isNaN(val)) return;
  update(ref(db, caminho), { quantidade: val });
  document.getElementById(`val-${id}`).value = "";
};

window.excluirItem = (caminho, nome) => {
  if (confirm(`Excluir o item "${nome}"?`)) remove(ref(db, caminho));
};

window.excluirCategoria = (caminho, nome) => {
  if (
    confirm(
      `⚠️ ATENÇÃO: Deseja excluir a categoria "${nome}" e TODOS os produtos dentro dela? Esta ação não pode ser desfeita.`
    )
  ) {
    remove(ref(db, caminho))
      .then(() => alert("Categoria removida com sucesso!"))
      .catch((err) => alert("Erro ao remover: " + err.message));
  }
};

window.enviarRelatorioWhatsApp = () => {
  onValue(
    ref(db, "produtos"),
    (snap) => {
      const dados = snap.val();
      if (!dados) return;
      let msg = "*📊 RELATÓRIO O REI DA COXINHA*\n\n";
      Object.keys(dados).forEach((cat) => {
        if (typeof dados[cat] === "object" && !dados[cat].nome) {
          msg += `📁 *${cat.toUpperCase()}*\n`;
          Object.keys(dados[cat]).forEach((id) => {
            const i = dados[cat][id];
            const q = i.quantidade !== undefined ? i.quantidade : 0;
            const st = q <= (i.estoqueMinimo || 0) ? "⚠️" : "✅";
            msg += `${st} ${i.nome}: ${q}${i.unidade || ""}\n`;
          });
          msg += "\n";
        }
      });
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`,
        "_blank"
      );
    },
    { onlyOnce: true }
  );
};

// Navegação
document.querySelectorAll(".nav-links li").forEach((li) => {
  li.onclick = () => {
    const sec = li.getAttribute("data-section");
    if (!sec) return;
    document
      .querySelectorAll(".nav-links li")
      .forEach((l) => l.classList.remove("active"));
    li.classList.add("active");
    document.getElementById("secao-estoque").style.display =
      sec === "secao-estoque" ? "block" : "none";
    document.getElementById("secao-historico").style.display =
      sec === "secao-historico" ? "block" : "none";
    if (window.innerWidth <= 768) toggleSidebar();
  };
});
