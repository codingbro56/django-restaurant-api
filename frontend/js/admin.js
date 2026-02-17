// ===============================
// ADMIN LOGIN
// ===============================

function adminLogin() {
  const usernameEl = document.getElementById("username");
  const passwordEl = document.getElementById("password");
  const resultEl = document.getElementById("result");

  if (!resultEl) return;
  resultEl.innerText = "";

  const username = usernameEl ? usernameEl.value.trim() : "";
  const password = passwordEl ? passwordEl.value : "";

  if (!username || !password) {
    resultEl.innerText = "Username and password required";
    return;
  }

  fetch(API_BASE_URL + "/api/auth/token-login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (!data || !data.access) {
        resultEl.innerText = "Invalid credentials";
        return Promise.reject(new Error("No token"));
      }

      // Save as ADMIN TOKEN
      localStorage.setItem("admin_token", data.access);

      // Verify role
      return fetch(API_BASE_URL + "/api/auth/me/", {
        headers: { Authorization: "Bearer " + data.access }
      });
    })
    .then(res => {
      if (!res.ok) {
        localStorage.removeItem("admin_token");
        resultEl.innerText = "Admin verification failed";
        return Promise.reject(new Error("Unauthorized"));
      }
      return res.json();
    })
    .then(user => {
      if (!user || !user.is_staff) {
        localStorage.removeItem("admin_token");
        resultEl.innerText = "Admin access required";
        return;
      }

      // Redirect after verification
      window.location.href = "dashboard.html";
    })
    .catch(err => {
      if (resultEl) {
        resultEl.innerText = "Login failed. Try again.";
      }
      console.error("[admin] login error:", err && err.message ? err.message : err);
    });
}

// ===============================
// ADMIN LOGOUT
// ===============================

function adminLogout() {
  localStorage.removeItem("admin_token");
  window.location.href = "login.html";
}
