// =======================
// LOAD ALL ADMIN ORDERS
// =======================
function loadAdminOrders() {
    const box = document.getElementById("admin-orders");
    if (!box) return;

    box.innerHTML = "Loading...";

    fetch(API_BASE_URL + "/api/orders/admin/", {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("admin_token")
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed");
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
                <a href="order-detail.html?id=${order.id}">
                  <button>View</button>
                </a>
              </div>
            `;

            box.appendChild(div);
        });
    })
    .catch(() => {
        box.innerText = "Failed to load orders";
    });
}

document.addEventListener("DOMContentLoaded", loadAdminOrders);



// =======================
// LOAD SINGLE ORDER DETAIL
// =======================
function loadAdminOrderDetail() {
    const infoDiv = document.getElementById("order-info");
    const itemsDiv = document.getElementById("order-items");
    if (!infoDiv || !itemsDiv) return;

    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("id");
    if (!orderId) return;

    fetch(API_BASE_URL + "/api/orders/admin/" + orderId + "/", {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("admin_token")
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
    })
    .then(order => {
        // ----- Order summary -----
        infoDiv.innerHTML = `
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>User:</strong> ${order.user}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Total:</strong> ₹${order.total_amount}</p>
        `;

        // ----- Order items -----
        itemsDiv.innerHTML = "";

        if (!order.items || order.items.length === 0) {
            itemsDiv.innerText = "No items found";
            return;
        }

        order.items.forEach(item => {
            // Defensive extraction (handles all backend shapes)
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
    .catch(() => {
        infoDiv.innerText = "Failed to load order";
        itemsDiv.innerHTML = "";
    });
}
document.addEventListener("DOMContentLoaded", loadAdminOrderDetail);

// Order Status Update
function updateOrderStatus(status) {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("id");

  fetch(API_BASE_URL + "/api/orders/admin/" + orderId + "/status/", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("admin_token")
    },
    body: JSON.stringify({ status: status })
  })
  .then(res => {
    if (!res.ok) throw new Error("Update failed");
    return res.json();
  })
  .then(() => {
    alert("Order updated");
    window.location.href = "orders.html";
  })
  .catch(err => {
    console.error("ORDER STATUS ERROR:", err);
    alert("Failed to update order");
  });
}


