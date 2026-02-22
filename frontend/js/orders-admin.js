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
    ordersData.filter(o => o.status === "placed").length;

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
      <td>${order.user || order.customer || "N/A"}</td>
      <td>${renderStatusBadge(order.status)}</td>
      <td>₹${order.total_amount}</td>
    `;

    tr.addEventListener("click", () => {
      selectedOrderId = order.id;
      renderOrderDetails(order);
      highlightRow(tr);
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

function renderOrderDetails(order) {
  const detailBox = document.getElementById("orderDetails");

  detailBox.innerHTML = `
    <p><strong>Order ID:</strong> #${order.id}</p>
    <p><strong>Customer:</strong> ${order.user || order.customer}</p>
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
    container.innerHTML = "<p>No items found</p>";
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="order-item-row">
      <span>${item.name || item.menu_item_name}</span>
      <span>x${item.quantity}</span>
      <strong>₹${item.total || item.total_price}</strong>
    </div>
  `).join("");
}

// ===============================
// ACTION BUTTONS (STATUS CONTROL)
// ===============================

function renderActionButtons(status) {

  // Only allow action if order is still placed
  if (status === "placed") {
    return `
      <button class="btn-accept" onclick="updateOrderStatus('completed')">
        Accept
      </button>
      <button class="btn-reject" onclick="updateOrderStatus('cancelled')">
        Reject
      </button>
    `;
  }

  // If already completed or cancelled → no buttons
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

    // Re-render selected order
    const updated = ordersData.find(o => o.id === selectedOrderId);
    if (updated) renderOrderDetails(updated);

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