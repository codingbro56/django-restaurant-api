(function () {
  function markActiveLink(root) {
    const currentPage = window.location.pathname.split("/").pop() || "";
    root.querySelectorAll(".sidebar-nav a").forEach((link) => {
      const isActive = link.getAttribute("data-page") === currentPage;
      link.classList.toggle("active", isActive);
    });
  }

  function bindLogout(root) {
    const logoutBtn = root.querySelector("#logoutBtn");
    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", () => {
      if (typeof adminLogout === "function") {
        adminLogout();
        return;
      }
      localStorage.removeItem("admin_token");
      window.location.href = "login.html";
    });
  }

  async function loadAdminSidebar() {
    const mount = document.getElementById("adminSidebar");
    if (!mount) return;

    try {
      const res = await fetch("../partials/sidebar.html");
      if (!res.ok) return;
      mount.innerHTML = await res.text();
      markActiveLink(mount);
      bindLogout(mount);
    } catch (err) {
      console.warn("[sidebar-loader] failed:", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadAdminSidebar);
  } else {
    loadAdminSidebar();
  }
})();
