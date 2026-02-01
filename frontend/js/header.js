function loadHeader() {
  const nav = document.getElementById("nav-links");
  const profileBox = document.getElementById("profile-box");
  const token = localStorage.getItem("access_token");

  if (!nav) return;
  nav.innerHTML = "";

  if (!token) {
    // GUEST
    nav.innerHTML = `
      <a href="../home/index.html">Home</a>
      <a href="../menu/index.html">Menu</a>
      <a href="../auth/login.html">Login</a>
      <a href="../auth/register.html">Register</a>
    `;
    profileBox?.classList.add("hidden");
  } else {
    // LOGGED IN USER
    nav.innerHTML = `
      <a href="../home/index.html">Home</a>
      <a href="../menu/index.html">Menu</a>
      <a href="../cart/index.html">Cart</a>
      <a href="../orders/my-orders.html">Orders</a>
    `;
    profileBox?.classList.remove("hidden");
  }
}

function logout() {
  localStorage.removeItem("access_token");
  window.location.href = "../home/index.html";
}

// Toggle dropdown
document.addEventListener("click", (e) => {
  const box = document.getElementById("profile-box");
  if (!box) return;
  box.classList.toggle("open", box.contains(e.target));
});

document.addEventListener("DOMContentLoaded", loadHeader);
