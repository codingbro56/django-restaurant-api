
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

// Event listeners for address editing

// Open modal
document.getElementById("edit-address-btn").addEventListener("click", () => {
    document.getElementById("address-modal").classList.remove("hidden");

    // Pre-fill current values
    document.getElementById("edit-name").value =
        document.getElementById("delivery-name").innerText;

    document.getElementById("edit-phone").value =
        document.getElementById("delivery-phone").innerText;

    document.getElementById("edit-address").value =
        document.getElementById("delivery-full-address").innerText;

    document.getElementById("edit-city").value =
        document.getElementById("delivery-city").innerText;

    document.getElementById("edit-state").value =
        document.getElementById("delivery-state").innerText;

    document.getElementById("edit-pincode").value =
        document.getElementById("delivery-pincode").innerText;
});

// Close modal
document.getElementById("cancel-edit").addEventListener("click", () => {
    document.getElementById("address-modal").classList.add("hidden");
});

// Save changes
document.getElementById("save-edit").addEventListener("click", async () => {

    const updatedData = {
        delivery_name: document.getElementById("edit-name").value,
        delivery_phone: document.getElementById("edit-phone").value,
        delivery_address: document.getElementById("edit-address").value,
        delivery_city: document.getElementById("edit-city").value,
        delivery_state: document.getElementById("edit-state").value,
        delivery_pincode: document.getElementById("edit-pincode").value
    };

    const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/update-address/`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
    });

    if (res.ok) {
        document.getElementById("address-modal").classList.add("hidden");
        loadOrder(); // refresh data
        showToast("Address updated successfully", "success");
    } else {
        showToast("Failed to update address", "error");
    }
});

// 

function renderOrder(order) {

    const itemsContainer = document.getElementById("order-items");

    const subtotalEl = document.getElementById("subtotal");
    const deliveryEl = document.getElementById("delivery-charge");
    const taxEl = document.getElementById("tax-amount");
    const totalEl = document.getElementById("total-amount");

    itemsContainer.innerHTML = "";

    if (!order.items || order.items.length === 0) {
        itemsContainer.innerHTML = "<p>No items found.</p>";
        return;
    }

    let subtotal = 0;

    order.items.forEach(item => {

        const itemTotal = parseFloat(item.price) * item.quantity;
        subtotal += itemTotal;

        const row = document.createElement("div");
        row.className = "summary-row";

        row.innerHTML = `
            <span>${item.menu_item_name} x ${item.quantity}</span>
            <span>₹${itemTotal.toFixed(2)}</span>
        `;

        itemsContainer.appendChild(row);
    });

    // Show breakdown
    subtotalEl.innerText = `₹${subtotal.toFixed(2)}`;
    deliveryEl.innerText = `₹${order.delivery_charge}`;
    taxEl.innerText = `₹${order.tax_amount}`;
    totalEl.innerText = `₹${order.total_amount}`;

    document.getElementById("delivery-name").innerText = order.delivery_name || "";
    document.getElementById("delivery-phone").innerText = order.delivery_phone || "";
    document.getElementById("delivery-full-address").innerText = order.delivery_address || "";
    document.getElementById("delivery-city").innerText = order.delivery_city || "";
    document.getElementById("delivery-state").innerText = order.delivery_state || "";
    document.getElementById("delivery-pincode").innerText = order.delivery_pincode || "";
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