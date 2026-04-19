function loadHeader() {
  const nav = document.getElementById("nav-links");
  const profileBox = document.getElementById("profile-box");
  const token = localStorage.getItem("access_token");

  if (!nav || !profileBox) return;

  const currentPath = window.location.pathname;

  // ===== NAV LINKS =====
  if (!token) {
    nav.innerHTML = `
      <a href="/index.html">Home</a>
      <a href="/menu/index.html">Menu</a>
      <a href="/feedback.html">Feedback</a>
      <a href="/aboutus.html">About Us</a>
      <a href="/contactus.html">Contact Us</a>
      <a href="/auth/login.html">Login</a>
      <a href="/auth/register.html">Register</a>
    `;

    profileBox.innerHTML = "";
    return;
  }

  nav.innerHTML = `
    <a href="/index.html">Home</a>
    <a href="/menu/index.html">Menu</a>
    <a href="/cart/index.html">Cart</a>
    <a href="/orders/my-orders.html">Orders</a>
    <a href="/feedback.html">Feedback</a>
    <a href="/aboutus.html">About Us</a>
    <a href="/contactus.html">Contact Us</a>
  `;

  // ===== PROFILE =====
  if (currentPath.includes("profile")) {
    profileBox.innerHTML = `
      <button class="secondary" onclick="logout()">Logout</button>
    `;
  } else {
    const initials = localStorage.getItem("user_initials") || "U";

    profileBox.innerHTML = `
      <div class="profile-avatar-header" id="profileAvatar">
        ${initials}
      </div>

      <div class="profile-dropdown" id="profileDropdown">
        <a href="/auth/profile.html">Profile</a>
        <button onclick="logout()">Logout</button>
      </div>
    `;
  }
}


/* ===== FIXED DROPDOWN ===== */
document.addEventListener("click", (e) => {
  const box = document.getElementById("profile-box");
  const avatar = document.getElementById("profileAvatar");

  if (!box || !avatar) return;

  if (avatar.contains(e.target)) {
    box.classList.toggle("open");
  } else {
    box.classList.remove("open");
  }
});


function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user_initials");

  // optional: clear other user data
  localStorage.removeItem("user_data");

  // redirect to login
  window.location.href = "/auth/login.html";
}


/* ===== MOBILE MENU ===== */
document.addEventListener("DOMContentLoaded", () => {
  loadHeader();

  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("nav-links");

  toggle?.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
});