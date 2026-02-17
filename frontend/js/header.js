function loadHeader() {
  const nav = document.getElementById("nav-links");
  const profileBox = document.getElementById("profile-box");
  const token = localStorage.getItem("access_token");

  if (!nav || !profileBox) return;

  nav.innerHTML = "";
  profileBox.innerHTML = "";

  const currentPath = window.location.pathname;

  if (!token) {
    nav.innerHTML = `
      <a href="../home/index.html">Home</a>
      <a href="../menu/index.html">Menu</a>
      <a href="../auth/login.html">Login</a>
      <a href="../auth/register.html">Register</a>
    `;
    return;
  }

  nav.innerHTML = `
    <a href="../home/index.html">Home</a>
    <a href="../menu/index.html">Menu</a>
    <a href="../cart/index.html">Cart</a>
    <a href="../orders/my-orders.html">Orders</a>
  `;

  if (currentPath.includes("profile")) {
    profileBox.innerHTML = `
      <button class="secondary" onclick="logout()">Logout</button>
    `;
  } else {
    const initials = localStorage.getItem("user_initials") || "U";

    profileBox.innerHTML = `
      <div class="profile-avatar-header"
           onclick="window.location.href='../auth/profile.html'">
        ${initials}
      </div>
    `;
  }
}



/* Profile dropdown */
document.addEventListener("click", (e) => {
  const box = document.getElementById("profile-box");
  if (!box) return;
  box.classList.toggle("open", box.contains(e.target));
});

/* Mobile menu toggle */
document.addEventListener("DOMContentLoaded", () => {
  loadHeader();

  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("nav-links");

  toggle?.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
});
