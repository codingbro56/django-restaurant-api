function loadHeader() {
  const nav = document.getElementById("nav-links");
  const token = localStorage.getItem("access_token");

  if(!nav) return;
  nav.innerHTML = "";

  if (!token) {
    // GUEST
    nav.innerHTML = `
      <a href="/frontend/home/index.html">Home</a>
      <a href="/frontend/menu/index.html">Menu</a>
      <a href="/frontend/auth/login.html">Login</a>
      <a href="/frontend/auth/register.html">Register</a>
    `;
  } else {
    // LOGGED IN USER
    nav.innerHTML = `
      <a href="/frontend/home/index.html">Home</a>
      <a href="/frontend/menu/index.html">Menu</a>
      <a href="/frontend/cart/index.html">Cart</a>
      <a href="/frontend/orders/my-orders.html">Orders</a>
      <a href="#" onclick="logout()">Logout</a>
    `;
  }
}

function logout() {
  localStorage.removeItem("access_token");
  window.location.href = "/frontend/home/index.html";
}

document.addEventListener("DOMContentLoaded", loadHeader);
