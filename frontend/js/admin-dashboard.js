// ===============================
// DASHBOARD LOGIC
// ===============================

function getAdminToken() {
  return localStorage.getItem("admin_token");
}

function handleAuthError(status) {
  if (status === 401) {
    localStorage.removeItem("admin_token");
    window.location.href = "login.html";
  }
}

// ===============================
// RENDER RECENT ORDERS
// ===============================
function renderRecentOrders(orders) {
  const tbody = document.getElementById("recentOrders");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!orders || orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">No recent orders</td></tr>`;
    return;
  }

  orders.forEach(order => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>#${order.id}</td>
      <td>${order.user}</td>
      <td><span class="status ${order.status}">${order.status}</span></td>
      <td>₹${order.total}</td>
    `;
    tbody.appendChild(row);
  });
}

// ===============================
// FETCH INITIAL DATA
// ===============================
function fetchInitialData() {
  const token = getAdminToken();
  if (!token) {
    console.warn("[admin-dashboard] No admin token found");
    return;
  }

  fetch(API_BASE_URL + "/api/admin/dashboard/", {
    headers: { Authorization: "Bearer " + token }
  })
    .then(res => {
      if (!res.ok) {
        handleAuthError(res.status);
        return Promise.reject(new Error("Failed to fetch dashboard"));
      }
      return res.json();
    })
    .then(data => {
      if (!data) return;

      const ordersEl = document.getElementById("ordersCount");
      const revenueEl = document.getElementById("revenueCount");
      const menuEl = document.getElementById("menuCount");
      const usersEl = document.getElementById("usersCount");

      if (ordersEl) ordersEl.innerText = data.total_orders ?? 0;
      if (revenueEl) revenueEl.innerText = "₹" + (data.total_revenue ?? 0);
      if (menuEl) menuEl.innerText = data.total_menu_items ?? 0;
      if (usersEl) usersEl.innerText = data.total_users ?? 0;

      renderRecentOrders(data.recent_orders || []);
    })
    .catch(err => {
      console.warn("[admin-dashboard] fetchInitialData error:", err && err.message ? err.message : err);
    });
}

// ===============================
// ATTACH EVENTS
// ===============================
function attachEvents() {
  const btn = document.getElementById("logoutBtn");
  if (btn) {
    btn.removeAttribute("onclick");
    btn.addEventListener("click", () => {
      const token = getAdminToken();
      if (token) {
        localStorage.removeItem("admin_token");
      }
      window.location.href = "login.html";
    });
  }
}

// ===============================
// INITIALIZE PAGE
// ===============================
function initPage() {
  attachEvents();
  fetchInitialData();
}

// ===============================
// READY
// ===============================
document.addEventListener("DOMContentLoaded", initPage);
