import { db } from "./firebase-config.js";
import {
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

// Relatório WhatsApp
document.getElementById("btn-whatsapp").onclick = () => {
  onValue(
    ref(db, "produtos"),
    (snap) => {
      const estoque = snap.val();
      if (!estoque) return alert("Estoque vazio!");

      let msg = "*RELATÓRIO O REI DA COXINHA*%0A%0A";
      for (let id in estoque) {
        const i = estoque[id];
        const alerta = i.quantidade <= (i.estoqueMinimo || 0) ? "🔴" : "🟢";
        msg += `${alerta} *${i.nome}:* ${i.quantidade}${i.unidade}%0A`;
      }
      window.open(`https://wa.me/5581985299617?text=${msg}`);
    },
    { onlyOnce: true }
  );
};

// Histórico na Tabela
onValue(ref(db, "historico"), (snap) => {
  const corpo = document.getElementById("corpo-historico");
  corpo.innerHTML = "";
  const dados = snap.val();
  if (!dados) return;

  for (let id in dados) {
    const h = dados[id];
    const row = `
      <tr>
        <td style="color:black;">${h.data}</td>
        <td style="color:black;">${h.produto}</td>
        <td style="color:${
          h.variacao < 0 ? "red" : "green"
        }; font-weight:bold;">${h.variacao}</td>
        <td style="color:black;">R$ ${h.custoTotal.toFixed(2)}</td>
      </tr>`;
    corpo.innerHTML += row;
  }
});
