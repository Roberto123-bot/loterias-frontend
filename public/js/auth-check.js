// Script de verificação de autenticação SIMPLIFICADO
// Versão que não depende de rota /api/auth/verificar

// Usar API_URL global definida no HTML
const getApiUrl = () => window.API_URL || "http://localhost:3000";

// Verificar se usuário está logado (versão simplificada)
function verificarAutenticacao() {
  const token = localStorage.getItem("token");
  const usuario = localStorage.getItem("usuario");

  // Se não tiver token OU usuário, redirecionar para login
  if (!token || !usuario) {
    console.log("❌ Sem autenticação - redirecionando para login");
    window.location.href = "login.html";
    return false;
  }

  // Verificar se o token não está expirado (se tiver campo 'exp')
  try {
    // Decodificar JWT (simples, sem validação de assinatura)
    const tokenParts = token.split(".");
    if (tokenParts.length === 3) {
      const payload = JSON.parse(atob(tokenParts[1]));

      // Verificar expiração se existir
      if (payload.exp) {
        const agora = Math.floor(Date.now() / 1000);
        if (payload.exp < agora) {
          console.log("❌ Token expirado - redirecionando para login");
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          window.location.href = "login.html";
          return false;
        }
      }
    }
  } catch (error) {
    console.warn("⚠️ Erro ao verificar token:", error);
    // Se der erro ao decodificar, continua mesmo assim
  }

  console.log("✅ Usuário autenticado");
  return true;
}

// Pegar informações do usuário logado
function getUsuarioLogado() {
  const usuarioStr = localStorage.getItem("usuario");
  return usuarioStr ? JSON.parse(usuarioStr) : null;
}

// Fazer logout
function logout() {
  console.log("🚪 Fazendo logout...");
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  window.location.href = "login.html";
}

// Adicionar botão de logout no header (se existir)
function adicionarBotaoLogout() {
  const usuario = getUsuarioLogado();

  if (usuario) {
    // ============================================
    // LISTA DE PÁGINAS QUE NÃO PRECISAM DO BOTÃO AUTOMÁTICO
    // (porque já têm botão próprio na barra superior)
    // ============================================
    const paginasSemBotao = [
      "index.html",
      "gerar-jogos.html",
      "meus-jogos.html",
      "conferir.html",
      "resultado.html",
      "mapa-dezenas.html",
      "gerador-combinacoes.html",
      "megasena.html",
      "lotofacil.html",
      "quina.html",
      "lotomania.html",
      "duplasena.html",
      "timemania.html",
      "diadasorte.html",
      "+milionaria.html",
    ];

    const paginaAtual = window.location.pathname.split("/").pop();

    // Se a página está na lista, não adicionar botão
    if (paginasSemBotao.includes(paginaAtual)) {
      console.log(
        `✅ Página ${paginaAtual} já tem botão próprio - pulando adição automática`
      );
      return;
    }

    // Procurar por header na página
    const header = document.querySelector("header .header-content, header");

    if (header) {
      console.log("➕ Adicionando botão de logout automaticamente");

      // Criar div de usuário
      const userDiv = document.createElement("div");
      userDiv.style.display = "flex";
      userDiv.style.alignItems = "center";
      userDiv.style.gap = "15px";
      userDiv.style.marginLeft = "auto";

      // Nome do usuário
      const userName = document.createElement("span");
      userName.textContent = `👤 ${usuario.nome}`;
      userName.style.color = "#667eea";
      userName.style.fontWeight = "600";

      // Botão de logout
      const logoutBtn = document.createElement("button");
      logoutBtn.textContent = "🚪 Sair";
      logoutBtn.style.padding = "10px 20px";
      logoutBtn.style.background = "#f44336";
      logoutBtn.style.color = "white";
      logoutBtn.style.border = "none";
      logoutBtn.style.borderRadius = "8px";
      logoutBtn.style.cursor = "pointer";
      logoutBtn.style.fontWeight = "bold";
      logoutBtn.style.transition = "opacity 0.3s";

      logoutBtn.onmouseover = () => (logoutBtn.style.opacity = "0.9");
      logoutBtn.onmouseout = () => (logoutBtn.style.opacity = "1");
      logoutBtn.onclick = logout;

      userDiv.appendChild(userName);
      userDiv.appendChild(logoutBtn);

      // Adicionar ao header
      header.appendChild(userDiv);
    }
  }
}

// Executar verificação ao carregar a página
window.addEventListener("DOMContentLoaded", () => {
  // Páginas públicas (não precisa de autenticação)
  const paginasPublicas = ["login.html", "registro.html"];
  const paginaAtual = window.location.pathname.split("/").pop();

  console.log(`📄 Página atual: ${paginaAtual}`);

  if (!paginasPublicas.includes(paginaAtual)) {
    // Verificar autenticação
    const autenticado = verificarAutenticacao();

    if (autenticado) {
      // Adicionar botão de logout (apenas se a página não tiver botão próprio)
      adicionarBotaoLogout();
    }
  } else {
    console.log("📄 Página pública - sem verificação de autenticação");
  }
});

// ============================================
// LOGIN (APENAS PARA login.html)
// ============================================
async function realizarLogin(email, senha) {
  const API_URL = getApiUrl();

  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  return response.json();
}

// Capturar submit do formulário de login
window.addEventListener("DOMContentLoaded", () => {
  const paginaAtual = window.location.pathname.split("/").pop();

  // Executar SOMENTE na página de login
  if (paginaAtual !== "login.html") return;

  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    try {
      const data = await realizarLogin(email, senha);

      if (data.success) {
        console.log("✅ Login realizado com sucesso");

        // 🔐 SALVAR TOKEN E USUÁRIO
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("usuario", JSON.stringify(data.data.usuario));

        // 🚀 REDIRECIONAR
        window.location.href = "index.html";
      } else {
        alert(data.message || "Erro ao fazer login");
      }
    } catch (err) {
      console.error("❌ Erro no login:", err);
      alert("Erro de conexão com o servidor");
    }
  });
});
