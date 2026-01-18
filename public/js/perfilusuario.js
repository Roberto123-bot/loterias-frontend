async function carregarConfiguracoes() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const token = localStorage.getItem("token");

  if (!usuario || !token) {
    alert("Sessão expirada. Faça login novamente.");
    window.location.href = "login.html";
    return;
  }

  // 🔹 Dados básicos
  document.getElementById("user-nome").textContent = usuario.nome;
  document.getElementById("user-email").textContent = usuario.email;

  // 🔹 Plano (mesma API do index.html)
  try {
    const response = await fetch(`${API_URL}/api/planos/meu-plano`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      const plano = data.data.plano; // "free" | "pro"
      const badge = document.getElementById("user-plano");

      if (plano === "pro") {
        badge.textContent = "PRÓ";
        badge.classList.add("pro");

        // Mostrar expiração
        document.getElementById("linha-expira").style.display = "flex";
        document.getElementById("user-expira").textContent = new Date(
          data.data.expiraEm,
        ).toLocaleDateString("pt-BR");
      } else {
        badge.textContent = "FREE";
        badge.classList.add("free");

        // Mostrar botão upgrade
        document.getElementById("btn-upgrade").style.display = "block";
      }
    }
  } catch (err) {
    console.error("Erro ao carregar plano:", err);
  }
}

document.addEventListener("DOMContentLoaded", carregarConfiguracoes);
