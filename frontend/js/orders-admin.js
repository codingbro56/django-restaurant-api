// ===============================
// ORDERS ADMIN MODULE
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

function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  if (!toast) {
    const temp = document.createElement("div");
    temp.style.cssText = "position:fixed;top:20px;right:20px;padding:12px 20px;background:#333;color:#fff;border-radius:8px;z-index:9999;";
    temp.innerText = message;
    document.body.appendChild(temp);
    setTimeout(() => temp.remove(), 3000);
    return;
  }

  toast.innerText = message;
  toast.className = "toast" + (isError ? " error" : "");
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

// ===============================
// LOAD ALL ADMIN ORDERS
// ===============================
function loadAdminOrders() {
  const token = getAdminToken();
  if (!token) return;

  const box = document.getElementById("admin-orders");
  if (!box) return;

  box.innerHTML = "Loading...";

  fetch(API_BASE_URL + "/api/orders/admin/", {
    headers: { Authorization: "Bearer " + token }
  })
    .then(res => {
      if (!res.ok) {
        handleAuthError(res.status);
        return Promise.reject(new Error("Failed to load orders"));
      }
      return res.json();
    })
    .then(data => {
      box.innerHTML = "";

      if (!data || data.length === 0) {
        box.innerText = "No orders found";
        return;
      }

      data.forEach(order => {
        const div = document.createElement("div");
        div.classList.add("admin-order-card");

        div.innerHTML = `
          <div class="admin-order-info">
            <h3>Order #${order.id}</h3>
            <p>User: ${order.user}</p>
            <p>Status: ${order.status}</p>
          </div>

          <div class="admin-order-actions">
            <strong>₹${order.total_amount}</strong>
            <a href="order-detail.html?id=${order.id}"><button>View</button></a>
          </div>
        `;

        box.appendChild(div);
      });
    })
    .catch(err => {
      box.innerText = "Failed to load orders";
      console.warn("[orders-admin] loadAdminOrders error:", err && err.message ? err.message : err);
    });
}

// ===============================
// LOAD SINGLE ORDER DETAIL
// ===============================
function loadAdminOrderDetail() {
  const token = getAdminToken();
  if (!token) return;

  const infoDiv = document.getElementById("order-info");
  const itemsDiv = document.getElementById("order-items");
  if (!infoDiv || !itemsDiv) return;

  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("id");
  if (!orderId) return;

  fetch(API_BASE_URL + "/api/orders/admin/" + orderId + "/", {
    headers: { Authorization: "Bearer " + token }
  })
    .then(res => {
      if (!res.ok) {
        handleAuthError(res.status);
        return Promise.reject(new Error("Failed to load order"));
      }
      return res.json();
    })
    .then(order => {
      // Order summary
      infoDiv.innerHTML = `
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>User:</strong> ${order.user}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <p><strong>Total:</strong> ₹${order.total_amount}</p>
      `;

      // Order items
      itemsDiv.innerHTML = "";

      if (!order.items || order.items.length === 0) {
        itemsDiv.innerText = "No items found";
        return;
      }

      order.items.forEach(item => {
        const itemName =
          item.menu_item?.name ||
          item.menu_item_name ||
          item.menu_item ||
          "Unknown Item";

        const quantity = item.quantity || 0;

        const unitPrice =
          item.price ||
          item.menu_item?.price ||
          item.menu_item_price ||
          0;

        const itemTotal =
          item.total_price ||
          item.total_amount ||
          item.total ||
          (unitPrice * (item.quantity || 1));

        const div = document.createElement("div");
        div.classList.add("admin-order-item");

        div.innerHTML = `
          <span>${itemName} × ${quantity}</span>
          <strong>₹${itemTotal}</strong>
        `;

        itemsDiv.appendChild(div);
      });
    })
    .catch(err => {
      infoDiv.innerText = "Failed to load order";
      itemsDiv.innerHTML = "";
      console.warn("[orders-admin] loadAdminOrderDetail error:", err && err.message ? err.message : err);
    });
}

// ===============================
// UPDATE ORDER STATUS
// ===============================
function updateOrderStatus(status) {
  const token = getAdminToken();
  if (!token) return;

  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("id");

  fetch(API_BASE_URL + "/api/orders/admin/" + orderId + "/status/", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ status })
  })
    .then(res => {
      if (!res.ok) {
        handleAuthError(res.status);
        return Promise.reject(new Error("Update failed"));
      }
      return res.json();
    })
    .then(() => {
      showToast("Order updated");
      setTimeout(() => {
        window.location.href = "orders.html";
      }, 1000);
    })
    .catch(err => {
      showToast(err && err.message ? err.message : "Failed to update order", true);
      console.warn("[orders-admin] updateOrderStatus error:", err && err.message ? err.message : err);
    });
}

// ===============================
// INITIALIZE
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("order-detail.html")) {
    loadAdminOrderDetail();
  } else {
    loadAdminOrders();
  }
});


