/**
 * ============================================
 * CONFIGURAÇÃO DE API - DETECTA DEV/PROD
 * ============================================
 */

// Detectar se está em produção ou desenvolvimento
const isProduction =
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1";

// URL DO BACKEND NO RAILWAY:
const PRODUCTION_API_URL = "https://loterias-backend-production.up.railway.app";
const DEVELOPMENT_API_URL = "http://localhost:3000";

// Escolher URL baseado no ambiente
const API_URL = isProduction ? PRODUCTION_API_URL : DEVELOPMENT_API_URL;

// Exportar para uso global
window.API_URL = API_URL;

// Log para debug
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🔧 CONFIGURAÇÃO:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("Ambiente:", isProduction ? "PRODUÇÃO 🌐" : "DESENVOLVIMENTO 💻");
console.log("API_URL:", API_URL);
console.log("Hostname:", window.location.hostname);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

// ============================================
// HELPERS ÚTEIS:
// ============================================

// Verificar se está logado
window.isAuthenticated = function () {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const agora = Date.now() / 1000;

    if (payload.exp && payload.exp < agora) {
      console.warn("⚠️ Token expirado");
      return false;
    }

    return true;
  } catch (e) {
    console.error("❌ Token inválido:", e);
    return false;
  }
};

// Obter dados do usuário
window.getUser = function () {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.id,
      email: payload.email,
      nome: payload.nome,
      role: payload.role,
      plano: payload.plano,
    };
  } catch (e) {
    console.error("❌ Erro ao obter usuário:", e);
    return null;
  }
};

// Fazer request autenticada (com token automático)
window.fetchAuth = async function (url, options = {}) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token não encontrado. Faça login novamente.");
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Se 401 (Unauthorized), redirecionar para login
  if (response.status === 401) {
    console.warn("⚠️ Sessão expirada. Redirecionando para login...");
    localStorage.clear();
    window.location.href = "/login.html";
    throw new Error("Sessão expirada");
  }

  return response;
};

// Log inicial
console.log("✅ config.js carregado com sucesso!");

// Verificar autenticação (se não estiver em login)
if (
  window.location.pathname !== "/login.html" &&
  window.location.pathname !== "/registro.html" &&
  window.location.pathname !== "/index.html" &&
  window.location.pathname !== "/"
) {
  if (isAuthenticated()) {
    const user = getUser();
    console.log("👤 Usuário:", user?.nome || "Anônimo");
    console.log("📦 Plano:", user?.plano || "FREE");
  } else {
    console.warn("⚠️ Usuário não autenticado");
  }
}
