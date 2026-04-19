const params = new URLSearchParams(window.location.search);
const orderId = params.get("order_id");
const token = localStorage.getItem("access_token");

const cancelBtn = document.getElementById("cancel-order-btn");

if (cancelBtn) {
    cancelBtn.addEventListener("click", async () => {

        const res = await fetch(
            `${API_BASE_URL}/api/orders/${orderId}/cancel/`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await res.json();

        if (res.ok) {
            showToast("Order cancelled successfully", "success");
            setTimeout(() => {
                window.location.href = "my-order.html";
            }, 1500);
        } else {
            showToast(data.error || "Cannot cancel order", "error");
        }

    });
}

if (!token) {
  window.location.href = "../auth/login.html";
}

if (!orderId) {
  window.location.href = "orders/my-orders.html";
}

async function loadSuccessData() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/payment/`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) {
      window.location.href = "orders/my-orders.html";
      return;
    }

    const data = await res.json();
    renderSuccess(data);

  } catch (error) {
    console.error(error);
    window.location.href = "orders/my-orders.html";
  }
}

function renderSuccess(order) {

  // Set Order ID
  const orderIdBox = document.getElementById("success-order-id");
  if (orderIdBox) {
    orderIdBox.innerText = `#${order.id}`;
  }

  // Total Amount
  const totalBox = document.getElementById("success-total");
  if (totalBox) {
    totalBox.innerText = `₹${order.total_amount}`;
  }

  // Payment Method
  const methodBox = document.getElementById("success-payment-method");
  if (methodBox && order.payment) {
    methodBox.innerText = order.payment.method;
  }

  // Payment Status
  const statusBox = document.getElementById("success-payment-status");
  if (statusBox && order.payment) {
    statusBox.innerText = order.payment.status;
  }

  // Estimated Delivery (Static for now)
  const deliveryBox = document.getElementById("success-delivery");
  if (deliveryBox) {
    deliveryBox.innerText = "30–45 minutes";
  }
}

if (order.status !== "pending") {
    document.getElementById("cancel-order-btn").style.display = "none";
}

document.addEventListener("DOMContentLoaded", loadSuccessData);