const token = localStorage.getItem("access_token");

const loginBtn = document.getElementById("login-btn");
// const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");

if (token) {
  // User logged in
  if (loginBtn) loginBtn.style.display = "none";
//   if (registerBtn) registerBtn.style.display = "none";
  if (logoutBtn) logoutBtn.style.display = "inline-block";
} else {
  // Public user
  if (logoutBtn) logoutBtn.style.display = "none";
}

// LOGOUT ACTION
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("access_token");
    window.location.reload();
  });
}
