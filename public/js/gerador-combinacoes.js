// ============================================
// GERADOR DE COMBINAÇÕES - JAVASCRIPT COMPLETO
// ============================================

// Configurações por loteria
const LOTERIAS_CONFIG = {
  megasena: {
    nome: "Mega-Sena",
    totalDezenas: 60,
    minDezenas: 6,
    maxDezenas: 15,
    dezenasObrigatorias: 6,
  },
  lotofacil: {
    nome: "Lotofácil",
    totalDezenas: 25,
    minDezenas: 15,
    maxDezenas: 18,
    dezenasObrigatorias: 15,
  },
  quina: {
    nome: "Quina",
    totalDezenas: 80,
    minDezenas: 5,
    maxDezenas: 15,
    dezenasObrigatorias: 5,
  },
  lotomania: {
    nome: "Lotomania",
    totalDezenas: 100,
    minDezenas: 50,
    maxDezenas: 50,
    dezenasObrigatorias: 50,
  },
  duplasena: {
    nome: "Dupla-Sena",
    totalDezenas: 50,
    minDezenas: 6,
    maxDezenas: 15,
    dezenasObrigatorias: 6,
  },
  timemania: {
    nome: "Timemania",
    totalDezenas: 80,
    minDezenas: 10,
    maxDezenas: 10,
    dezenasObrigatorias: 10,
  },
  diadasorte: {
    nome: "Dia de Sorte",
    totalDezenas: 31,
    minDezenas: 7,
    maxDezenas: 15,
    dezenasObrigatorias: 7,
  },
  maismilionaria: {
    nome: "+Milionária",
    totalDezenas: 50,
    minDezenas: 6,
    maxDezenas: 12,
    dezenasObrigatorias: 6,
  },
};

// Variáveis globais
let loteriaSelecionada = null;
let dezenasSelecionadas = new Set();
let dezenasFixas = new Set();
let jogosGerados = [];
let renderIndex = 0;
const BATCH_SIZE = 30;

const LIMITE_JOGOS = 1000;

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  const selectLoteria = document.getElementById("select-loteria");

  selectLoteria.addEventListener("change", (e) => {
    const loteria = e.target.value;
    if (loteria) {
      loteriaSelecionada = loteria;
      inicializarGrid(loteria);
    } else {
      document.getElementById("dezenas-section").style.display = "none";
    }
  });
});

// ============================================
// CRIAR GRID DE DEZENAS
// ============================================

function inicializarGrid(loteria) {
  const config = LOTERIAS_CONFIG[loteria];
  const grid = document.getElementById("grid-dezenas");
  const section = document.getElementById("dezenas-section");

  // Limpa seleções anteriores
  dezenasSelecionadas.clear();
  dezenasFixas.clear();
  grid.innerHTML = "";

  // Cria botões
  for (let i = 1; i <= config.totalDezenas; i++) {
    const btn = document.createElement("div");
    btn.className = "dezena-btn";
    btn.textContent = i.toString().padStart(2, "0");
    btn.dataset.dezena = i.toString().padStart(2, "0");
    btn.addEventListener("click", () => toggleDezena(btn));
    grid.appendChild(btn);
  }

  section.style.display = "block";
  atualizarContador();
  atualizarBotaoGerar();
}

// ============================================
// TOGGLE DEZENA (SELECIONADA → FIXA → DESMARCADA)
// ============================================

function toggleDezena(btn) {
  const dezena = btn.dataset.dezena;

  // 1. Está FIXA? → Remove tudo
  if (btn.classList.contains("fixa")) {
    btn.classList.remove("fixa", "selecionada");
    dezenasSelecionadas.delete(dezena);
    dezenasFixas.delete(dezena);
  }
  // 2. Está SELECIONADA? → Torna FIXA
  else if (btn.classList.contains("selecionada")) {
    btn.classList.add("fixa");
    dezenasFixas.add(dezena);
  }
  // 3. Não está selecionada? → Torna SELECIONADA
  else {
    btn.classList.add("selecionada");
    dezenasSelecionadas.add(dezena);
  }

  atualizarContador();
  atualizarBotaoGerar();
}

// ============================================
// SELECIONAR/LIMPAR TODAS
// ============================================

function selecionarTodas() {
  const config = LOTERIAS_CONFIG[loteriaSelecionada];
  const botoes = document.querySelectorAll(".dezena-btn");

  const todasSelecionadas = dezenasSelecionadas.size === config.totalDezenas;

  dezenasSelecionadas.clear();
  dezenasFixas.clear();

  botoes.forEach((btn) => {
    if (todasSelecionadas) {
      btn.classList.remove("selecionada", "fixa");
    } else {
      btn.classList.add("selecionada");
      btn.classList.remove("fixa");
      dezenasSelecionadas.add(btn.dataset.dezena);
    }
  });

  atualizarContador();
  atualizarBotaoGerar();
}

function limparSelecao() {
  dezenasSelecionadas.clear();
  dezenasFixas.clear();

  document.querySelectorAll(".dezena-btn").forEach((btn) => {
    btn.classList.remove("selecionada", "fixa");
  });

  atualizarContador();
  atualizarBotaoGerar();
}

// ============================================
// ATUALIZAR UI
// ============================================

function atualizarContador() {
  const contador = document.getElementById("contador");
  const fixas = dezenasFixas.size;

  if (fixas > 0) {
    contador.textContent = `${dezenasSelecionadas.size} selecionadas (${fixas} fixas)`;
  } else {
    contador.textContent = `${dezenasSelecionadas.size} selecionadas`;
  }
}

function atualizarBotaoGerar() {
  const config = LOTERIAS_CONFIG[loteriaSelecionada];
  const btnGerar = document.getElementById("btn-gerar");

  const min = config.minDezenas;
  btnGerar.disabled = dezenasSelecionadas.size < min;
}

// ============================================
// MODAL
// ============================================

function abrirModal() {
  const config = LOTERIAS_CONFIG[loteriaSelecionada];
  const modal = document.getElementById("modal-randomico");
  const title = document.getElementById("modal-title");

  const fixas = dezenasFixas.size;
  const total = dezenasSelecionadas.size;

  title.textContent = `Randômico de ${total} dezenas${
    fixas > 0 ? ` (${fixas} fixas)` : ""
  }`;

  // Configurar sliders
  const dezenasSlider = document.getElementById("dezenas-slider");
  dezenasSlider.min = config.minDezenas;
  dezenasSlider.max = Math.min(config.maxDezenas, total);
  dezenasSlider.value = config.dezenasObrigatorias;

  atualizarDisplayDezenas();
  atualizarMaxJogos();

  modal.classList.add("active");
}

function fecharModal() {
  const modal = document.getElementById("modal-randomico");
  modal.classList.remove("active");
}

// ============================================
// AJUSTAR SLIDERS
// ============================================

function ajustarDezenas(delta) {
  const slider = document.getElementById("dezenas-slider");
  let valor = parseInt(slider.value) + delta;

  valor = Math.max(parseInt(slider.min), Math.min(parseInt(slider.max), valor));
  slider.value = valor;

  atualizarDisplayDezenas();
  atualizarMaxJogos();
}

function ajustarJogos(delta) {
  const slider = document.getElementById("jogos-slider");
  let valor = parseInt(slider.value) + delta;

  valor = Math.max(1, Math.min(parseInt(slider.max), valor));
  slider.value = valor;

  atualizarDisplayJogos();
}

function atualizarDisplayDezenas() {
  const slider = document.getElementById("dezenas-slider");
  const display = document.getElementById("dezenas-display");
  display.textContent = slider.value;
}

function atualizarDisplayJogos() {
  const slider = document.getElementById("jogos-slider");
  const display = document.getElementById("jogos-display");
  display.textContent = `${slider.value} de ${slider.max}`;
}

function atualizarMaxJogos() {
  const k = parseInt(document.getElementById("dezenas-slider").value);
  const fixas = dezenasFixas.size;
  const variaveis = Array.from(dezenasSelecionadas).filter(
    (d) => !dezenasFixas.has(d)
  );

  const kVariavel = k - fixas;

  if (kVariavel < 0 || kVariavel > variaveis.length) {
    document.getElementById("jogos-slider").max = 1;
    atualizarDisplayJogos();
    return;
  }

  const totalComb = combinacao(variaveis.length, kVariavel);
  const maxJogos = Math.min(totalComb, LIMITE_JOGOS);

  const slider = document.getElementById("jogos-slider");
  slider.max = maxJogos;

  if (parseInt(slider.value) > maxJogos) {
    slider.value = maxJogos;
  }

  atualizarDisplayJogos();
}

// Event listeners dos sliders
document.addEventListener("DOMContentLoaded", () => {
  const dezenasSlider = document.getElementById("dezenas-slider");
  const jogosSlider = document.getElementById("jogos-slider");

  if (dezenasSlider) {
    dezenasSlider.addEventListener("input", () => {
      atualizarDisplayDezenas();
      atualizarMaxJogos();
    });
  }

  if (jogosSlider) {
    jogosSlider.addEventListener("input", atualizarDisplayJogos);
  }
});

// ============================================
// CÁLCULO COMBINATÓRIO
// ============================================

function fatorial(n) {
  if (n < 0) return -1;
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) {
    res *= i;
  }
  return res;
}

function combinacao(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (k > n / 2) k = n - k;

  let res = 1;
  for (let i = 1; i <= k; i++) {
    res = (res * (n - i + 1)) / i;
  }
  return Math.round(res);
}

// ============================================
// GERAÇÃO DE COMBINAÇÕES
// ============================================

function gerarCombinacoes() {
  const k = parseInt(document.getElementById("dezenas-slider").value);
  const numJogos = parseInt(document.getElementById("jogos-slider").value);

  const fixasArray = Array.from(dezenasFixas).sort();
  const variaveisArray = Array.from(dezenasSelecionadas)
    .filter((d) => !dezenasFixas.has(d))
    .sort();

  const kVariavel = k - fixasArray.length;

  if (kVariavel < 0 || kVariavel > variaveisArray.length) {
    alert("Configuração inválida! Ajuste o número de dezenas por jogo.");
    return;
  }

  // Gera combinações aleatórias
  const combinacoesVariaveis = gerarCombinacoesAleatorias(
    variaveisArray,
    kVariavel,
    numJogos
  );

  // Monta jogos finais (fixas + variáveis)
  jogosGerados = combinacoesVariaveis.map((combVariavel) => {
    return [...fixasArray, ...combVariavel].sort((a, b) => {
      return parseInt(a) - parseInt(b);
    });
  });

  exibirJogos();
  fecharModal();
}

function gerarCombinacoesAleatorias(elementos, tamanho, quantidade) {
  const jogos = new Set();
  const maxIteracoes = quantidade * 10;
  let iteracoes = 0;

  while (jogos.size < quantidade && iteracoes < maxIteracoes) {
    const jogo = [];
    const temp = [...elementos];

    for (let i = 0; i < tamanho; i++) {
      const idx = Math.floor(Math.random() * temp.length);
      jogo.push(temp[idx]);
      temp.splice(idx, 1);
    }

    jogo.sort((a, b) => parseInt(a) - parseInt(b));
    jogos.add(jogo.join(" "));
    iteracoes++;
  }

  return Array.from(jogos).map((s) => s.split(" "));
}

// ============================================
// EXIBIR JOGOS GERADOS
// ============================================

function exibirJogos() {
  document.getElementById("dezenas-section").style.display = "none";
  document.getElementById("jogos-gerados").style.display = "block";

  document.getElementById("lista-jogos").innerHTML = "";
  document.getElementById("total-jogos").textContent = jogosGerados.length;

  renderIndex = 0;
  renderizarJogosIncremental();
}

function renderizarJogosIncremental() {
  const lista = document.getElementById("lista-jogos");

  const fim = Math.min(renderIndex + BATCH_SIZE, jogosGerados.length);

  for (let i = renderIndex; i < fim; i++) {
    lista.appendChild(criarCardJogo(jogosGerados[i]));
  }

  renderIndex = fim;
}

function criarCardJogo(jogo) {
  const card = document.createElement("div");
  card.className = "jogo-card";

  const dezenas = document.createElement("div");
  dezenas.className = "jogo-dezenas";

  jogo.forEach((dezena) => {
    const bolinha = document.createElement("div");
    bolinha.className = "bolinha";
    bolinha.textContent = dezena;

    if (dezenasFixas.has(dezena)) {
      bolinha.classList.add("fixa");
    }

    dezenas.appendChild(bolinha);
  });

  card.appendChild(dezenas);
  return card;
}

// ============================================
// SALVAR JOGOS
// ============================================

async function salvarTodos() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Você precisa fazer login primeiro!");
    window.location.href = "login.html";
    return;
  }

  if (jogosGerados.length === 0) {
    alert("Nenhum jogo para salvar!");
    return;
  }

  const btn = event.target;
  btn.disabled = true;
  btn.textContent = `Salvando ${jogosGerados.length} jogos...`;

  try {
    // Converte jogos para formato string
    const jogosString = jogosGerados.map((jogo) => jogo.join(" "));

    const response = await fetch(`${API_URL}/api/jogos/salvar-lote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        loteria: loteriaSelecionada,
        jogos: jogosString,
      }),
    });

    const data = await response.json();

    if (data.success) {
      alert(`✅ ${jogosGerados.length} jogos salvos com sucesso!`);
      limparJogos();
      window.location.href = "meus-jogos.html";
    } else {
      throw new Error(data.message || "Erro ao salvar jogos");
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao salvar jogos: " + error.message);
    btn.disabled = false;
    btn.textContent = "Salvar Todos os Jogos";
  }
}

function limparJogos() {
  jogosGerados = [];
  document.getElementById("jogos-gerados").style.display = "none";
  document.getElementById("lista-jogos").innerHTML = "";
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("jogos-gerados");

  container.addEventListener("scroll", () => {
    if (
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 100
    ) {
      if (renderIndex < jogosGerados.length) {
        renderizarJogosIncremental();
      }
    }
  });
});

function voltarParaSelecao() {
  renderIndex = 0;
  document.getElementById("jogos-gerados").style.display = "none";
  document.getElementById("dezenas-section").style.display = "block";
}

function limparJogos() {
  jogosGerados = [];
  renderIndex = 0;

  document.getElementById("lista-jogos").innerHTML = "";
  document.getElementById("jogos-gerados").style.display = "none";
  document.getElementById("dezenas-section").style.display = "block";
}
