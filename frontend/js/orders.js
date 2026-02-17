const token = localStorage.getItem("access_token");

if (!token) {
  window.location.href = "../auth/login.html";
}

// UI message helper
function showOrderMsg(text, type = "info") {
  const msg = document.getElementById("orders-msg");
  msg.innerText = text;
  msg.className = `ui-message ${type}`;
  msg.classList.remove("hidden");

  setTimeout(() => msg.classList.add("hidden"), 3000);
}

// Load Orders
function loadOrders() {
  const box = document.getElementById("orders-list");
  if (!box) return;

  const token = localStorage.getItem("access_token");

  fetch(API_BASE_URL + "/api/orders/my/", {
    headers: {
      Authorization: "Bearer " + token
    }
  })
  .then(res => res.json())
  .then(data => {
    box.innerHTML = "";

    if (!data || data.length === 0) {
      box.innerHTML = `<p class="empty-text">No orders found</p>`;
      return;
    }

    data.forEach(order => {
      const statusClass = order.status.toLowerCase();

      const card = document.createElement("div");
      card.className = "order-card";

      card.innerHTML = `
        <div class="order-left">
          <h3>Order #${order.id}</h3>
          <p class="order-date">
            ${new Date(order.created_at).toLocaleDateString()}
          </p>
          <p class="order-amount">₹${order.total_amount}</p>
        </div>

        <div class="order-right">
          <span class="order-status ${statusClass}">
            ${order.status}
          </span>
        </div>
      `;

      box.appendChild(card);
    });
  })
  .catch(() => {
    box.innerHTML = `<p class="error-text">Failed to load orders</p>`;
  });
}

document.addEventListener("DOMContentLoaded", loadOrders);
