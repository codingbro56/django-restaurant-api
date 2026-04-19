console.log("Orders JS loaded"); // temporary debug log to confirm script is running

// ===============================
// SAFE INITIALIZATION
// ===============================

(function initOrdersModule() {
  console.log("Orders module initialized");

  // If DOM is already loaded, run immediately
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  function start() {
    loadOrders();
    setupLogout();
  }
})();

// ===============================
// ADMIN ORDER MANAGEMENT (TABLE VERSION)
// ===============================

let ordersData = [];
let selectedOrderId = null;
let highlightedRow = null;


// ===============================
// LOAD ORDERS
// ===============================

async function loadOrders() {
  console.log("Fetching orders..."); // debug log to confirm function is called
  const token = localStorage.getItem("admin_token");
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/orders/admin/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      console.error("Failed to fetch orders:", res.status);
      return;
    }

    const data = await res.json();
    ordersData = Array.isArray(data) ? data : (data.results || []);

    renderKPIs();
    renderOrdersTable();

    // If an order is selected, keep it highlighted and show details
    if (selectedOrderId) {
      const selectedOrder = ordersData.find(o => o.id === selectedOrderId);
      if (selectedOrder) {
        renderOrderDetails(selectedOrder);
        highlightSelectedRow();
      } else {
        selectedOrderId = null;
        clearOrderDetails();
      }
    }

  } catch (err) {
    console.error("Orders fetch error:", err);
  }
}

// ===============================
// RENDER KPI COUNTS
// ===============================

function renderKPIs() {
  document.getElementById("totalOrders").innerText = ordersData.length;

  // Pending = placed
  document.getElementById("pendingOrders").innerText =
    ordersData.filter(o => o.status === "pending").length;

  document.getElementById("completedOrders").innerText =
    ordersData.filter(o => o.status === "completed").length;

  document.getElementById("cancelledOrders").innerText =
    ordersData.filter(o => o.status === "cancelled").length;
}

// ===============================
// RENDER TABLE
// ===============================

function renderOrdersTable() {
  const tbody = document.getElementById("ordersList");
  tbody.innerHTML = "";

  if (!ordersData.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;">No orders found</td>
      </tr>
    `;
    return;
  }

  ordersData.forEach(order => {
    const tr = document.createElement("tr");
    tr.style.cursor = "pointer";
    tr.dataset.orderId = order.id;

    tr.innerHTML = `
      <td>#${order.id}</td>
      <td>${order.username || "N/A"}</td>
      <td>${renderStatusBadge(order.status)}</td>
      <td>₹${order.total_amount}</td>
    `;

    tr.addEventListener("click", async () => {
      selectedOrderId = order.id;
      highlightRow(tr);
      await fetchAndRenderOrderDetails(order.id);
    });

    tbody.appendChild(tr);
  });
  highlightSelectedRow();
}

// ===============================
// STATUS BADGE
// ===============================

function renderStatusBadge(status) {

  let label = status;

  if (status === "placed") {
    label = "pending";
  }

  return `
    <span class="status-badge status-${status}">
      ${label}
    </span>
  `;
}

// ===============================
// HIGHLIGHT SELECTED ROW
// ===============================

function highlightRow(selectedRow) {
  const rows = document.querySelectorAll("#ordersList tr");
  rows.forEach(row => row.classList.remove("active-row"));
  selectedRow.classList.add("active-row");
  highlightedRow = selectedRow;
}

function highlightSelectedRow() {
  if (!selectedOrderId) return;
  const rows = document.querySelectorAll("#ordersList tr");
  rows.forEach(row => {
    if (row.dataset.orderId == selectedOrderId) {
      row.classList.add("active-row");
      highlightedRow = row;
    } else {
      row.classList.remove("active-row");
    }
  });
}

function clearOrderDetails() {
  const detailBox = document.getElementById("orderDetails");
  detailBox.innerHTML = "<p>Select an order to view details.</p>";
}

// ===============================
// RENDER ORDER DETAILS (RIGHT SIDE)
// ===============================


// Fetch order detail from API and render
async function fetchAndRenderOrderDetails(orderId) {
  const token = localStorage.getItem("admin_token");
  if (!token) {
    clearOrderDetails();
    return;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/orders/admin/${orderId}/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) {
      clearOrderDetails();
      return;
    }
    const detail = await res.json();
    renderOrderDetails(detail);
  } catch (err) {
    clearOrderDetails();
  }
}

function renderOrderDetails(order) {
  const detailBox = document.getElementById("orderDetails");

  detailBox.innerHTML = `
    <p><strong>Order ID:</strong> #${order.id}</p>
    <p><strong>Customer:</strong> ${order.username || "N/A"}</p>
    <p><strong>Status:</strong> 
      ${renderStatusBadge(order.status)}
    </p>
    <p><strong>Total Amount:</strong> ₹${order.total_amount}</p>

    <hr style="margin:15px 0; border-color:#1e293b;">

    <h4>Items</h4>
    <div id="orderItems"></div>

    <div class="order-actions">
      ${renderActionButtons(order.status)}
    </div>
  `;

  renderOrderItems(order.items);
}

// ===============================
// RENDER ORDER ITEMS
// ===============================

function renderOrderItems(items) {
  const container = document.getElementById("orderItems");

  if (!items || !items.length) {
    container.innerHTML = "<p style='color:#94a3b8;'>No items found</p>";
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="order-item-row">
      <div class="order-item-left">
        <span class="order-item-name">${item.item_name}</span>
        <span class="order-item-qty">Quantity: ${item.quantity}</span>
      </div>
      <div class="order-item-price">
        ₹${item.total}
      </div>
    </div>
  `).join("");
}

// ===============================
// ACTION BUTTONS (STATUS CONTROL)
// ===============================

function renderActionButtons(status) {

  // Backend raw status
  if (status === "pending") {
    return `
      <button class="btn-accept" onclick="updateOrderStatus('completed')">
        Accept
      </button>
      <button class="btn-reject" onclick="updateOrderStatus('cancelled')">
        Reject
      </button>
    `;
  }
  return "";
}

// Attach event listeners to action buttons after rendering order details
document.getElementById("orderDetails").addEventListener("click", async function(e) {
  if (e.target && e.target.matches("button[data-status]")) {
    const newStatus = e.target.getAttribute("data-status");
    await updateOrderStatus(newStatus);
  }
});


// ===============================
// UPDATE ORDER STATUS
// ===============================

async function updateOrderStatus(newStatus) {
  const token = localStorage.getItem("admin_token");
  if (!token || !selectedOrderId) return;

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/orders/admin/${selectedOrderId}/status/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      }
    );

    if (!res.ok) {
      console.error("Status update failed:", res.status);
      return;
    }

    // Reload all orders
    await loadOrders();

    // Re-fetch and render selected order detail
    if (selectedOrderId) {
      await fetchAndRenderOrderDetails(selectedOrderId);
    }

  } catch (err) {
    console.error("Update error:", err);
  }
}

// ===============================
// LOGOUT
// ===============================

function setupLogout() {
  const btn = document.getElementById("logoutBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    localStorage.removeItem("admin_token");
    window.location.href = "login.html";
  });
}