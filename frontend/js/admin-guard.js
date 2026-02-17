// ===============================
// STRICT ADMIN GUARD (IIFE)
// ===============================

(function () {
  // Don't run guard on login page
  if (window.location.pathname.includes("login.html")) {
    return;
  }

  const token = localStorage.getItem("admin_token");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  fetch(API_BASE_URL + "/api/auth/me/", {
    headers: { Authorization: "Bearer " + token }
  })
    .then(res => {
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("admin_token");
          window.location.href = "login.html";
        }
        return Promise.reject(new Error("Profile check failed"));
      }
      return res.json();
    })
    .then(user => {
      if (!user || !user.is_staff) {
        localStorage.removeItem("admin_token");
        window.location.href = "login.html";
      }
    })
    .catch(err => {
      console.warn("[admin-guard] error:", err && err.message ? err.message : err);
    });
})();
