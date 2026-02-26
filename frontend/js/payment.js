
const params = new URLSearchParams(window.location.search);
const orderId = params.get("order_id");

const token = localStorage.getItem("access_token");

if (!orderId) {
    showToast("Invalid order.", "error");
    setTimeout(() => {
        window.location.href = "/cart/index.html";
    }, 1500);
}

async function loadOrder() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/payment/`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            showToast("Failed to load order.", "error");
            return;
        }

        const data = await res.json();

        renderOrder(data);

    } catch (err) {
        showToast("Something went wrong.", "error");
    }
}

function renderOrder(order) {

    const itemsContainer = document.getElementById("order-items");
    const subtotalEl = document.getElementById("subtotal");
    const totalEl = document.getElementById("total-amount");

    itemsContainer.innerHTML = "";

    if (!order.items || order.items.length === 0) {
        itemsContainer.innerHTML = "<p>No items found.</p>";
        return;
    }

    order.items.forEach(item => {

        const row = document.createElement("div");
        row.className = "summary-row";

        const itemTotal = parseFloat(item.price) * item.quantity;

        row.innerHTML = `
            <span>${item.menu_item_name} x ${item.quantity}</span>
            <span>₹${itemTotal.toFixed(2)}</span>
        `;

        itemsContainer.appendChild(row);
    });

    subtotalEl.innerText = `₹${order.total_amount}`;
    totalEl.innerText = `₹${order.total_amount}`;
}

async function confirmCOD() {

    try {
        const res = await fetch(`${API_BASE_URL}/api/payment/cod/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ order_id: orderId })
        });

        const data = await res.json();

        if (res.ok) {
            showToast("Order placed successfully. Pay on delivery.", "success");

            setTimeout(() => {
                window.location.href = `/orders/success.html?order_id=${orderId}`;
            }, 1500);
        } else {
            showToast(data.error || "Error processing payment.", "error");
        }

    } catch (err) {
        showToast("Network error.", "error");
    }
}

document.getElementById("confirm-btn")
    .addEventListener("click", confirmCOD);

function showToast(message, type) {
    const container = document.getElementById("toast-container");

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

loadOrder();