// Redirect if not logged in
if (!localStorage.getItem("access_token")) {
  window.location.href = "../auth/login.html";
}


// =======================
// PLACE ORDER
// =======================
function placeOrder() {
  const token = localStorage.getItem("access_token");

  // 🔒 Guard: not logged in
  if (!token) {
    alert("Please login to place an order");
    window.location.href = "../auth/login.html";
    return;
  }

  fetch(API_BASE_URL + "/api/orders/place/", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token
    }
  })
  .then(res => {
    if (res.status === 401) {
      throw new Error("Unauthorized");
    }
    if (!res.ok) {
      throw new Error("Order failed");
    }
    return res.json();
  })
  .then(() => {
    window.location.href = "../orders/success.html";
  })
  .catch(err => {
    if (err.message === "Unauthorized") {
      alert("Session expired. Please login again.");
      localStorage.removeItem("access_token");
      window.location.href = "../auth/login.html";
    } else {
      alert("Order could not be placed");
    }
    console.error(err);
  });
}



// =======================
// LOAD MY ORDERS
// =======================
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
      box.innerText = "No orders found";
      return;
    }

    data.forEach(order => {
      const div = document.createElement("div");
      div.classList.add("order-card");

      div.innerHTML = `
        <h3>Order #${order.id}</h3>
        <p>Status: ${order.status}</p>
        <p>Total: ₹${order.total_amount}</p>
      `;

      box.appendChild(div);
    });
  })
  .catch(() => {
    box.innerText = "Failed to load orders";
  });
}


// =======================
// AUTO LOAD (SAFE)
// =======================
document.addEventListener("DOMContentLoaded", loadOrders);
