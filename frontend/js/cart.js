const token = localStorage.getItem("access_token");
const TAX_RATE = 0.08;

if (!token) {
  window.location.href = "../auth/login.html";
}

// LOAD CART
function loadCart() {
  fetch(API_BASE_URL + "/api/cart/", {
    headers: {
      Authorization: "Bearer " + token
    }
  })
  .then(res => {
    if (!res.ok) throw new Error();
    return res.json();
  })
  .then(data => {
    const container = document.getElementById("cart-items");

    container.innerHTML = "";

    let subtotal = 0;

    if (!data.items || data.items.length === 0) {
      container.innerHTML = "<p>Your cart is empty</p>";
      updateSummary(0);
      return;
    }

    data.items.forEach(item => {
      subtotal += item.subtotal;

      const imageUrl = item.image ? API_BASE_URL + item.image : '../assets/images/hero-food.jpg';

      container.innerHTML += `
        <div class="cart-item">
          <img src="${imageUrl}">

          <div class="item-info">
            <h4>${item.name}</h4>
            <small>₹${item.price} / item</small>
          </div>

          <div class="qty-controls">
            <button onclick="updateQty(${item.id}, ${item.quantity - 1})">−</button>
            <span>${item.quantity}</span>
            <button onclick="updateQty(${item.id}, ${item.quantity + 1})">+</button>
          </div>

          <div class="price">₹${item.subtotal}</div>

          <button class="delete" onclick="removeItem(${item.id})">🗑</button>
        </div>
      `;
    });

    updateSummary(subtotal);
  })
  .catch(() => {
    document.getElementById("cart-items").innerText =
      "Failed to load cart";
  });
}

// UPDATE SUMMARY
function updateSummary(subtotal) {
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  document.getElementById("subtotal").innerText = subtotal.toFixed(2);
  document.getElementById("tax").innerText = tax.toFixed(2);
  document.getElementById("grandTotal").innerText = total.toFixed(2);
}

// UPDATE QUANTITY
function updateQty(id, qty) {
  if (qty < 1) return;

  fetch(API_BASE_URL + `/api/cart/update/${id}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ quantity: qty })
  })
  .then(res => {
    if (!res.ok) throw new Error();
    loadCart();
  })
  .catch(() => {
    showToast("Failed to update quantity", "error");
  });
}


// REMOVE ITEM
function removeItem(id) {
  fetch(API_BASE_URL + `/api/cart/remove/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token
    }
  })
  .then(res => {
    if (!res.ok) throw new Error();
    showToast("Item removed from cart", "success");
    loadCart();
  })
  .catch(() => {
    showToast("Failed to remove item", "error");
  });
}


// CLEAR CART
function clearCart() {
  fetch(API_BASE_URL + "/api/cart/clear/", {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token
    }
  })
  .then(res => {
    if (!res.ok) throw new Error();
    showToast("Cart cleared", "success");
    loadCart();
  })
  .catch(() => {
    showToast("Failed to clear cart", "error");
  });
}


// PLACE ORDER
async function placeOrder() {
   try {
      const res = await fetch(`${API_BASE_URL}/api/orders/place/`, {
         method: "POST",
         headers: {
            "Authorization": `Bearer ${token}`
         }
      });

      if (!res.ok) {
         const text = await res.text();
         console.error("Server response:", text);
         showToast("Failed to place order", "error");
         return;
      }

      const data = await res.json();

      window.location.href = `/payment.html?order_id=${data.id}`;

   } catch (error) {
      console.error(error);
      showToast("Network error", "error");
   }
}


document.addEventListener("DOMContentLoaded", loadCart);


function showToast(message, type = "success") {
  const toast = document.getElementById("ui-toast");
  if (!toast) return;

  toast.textContent = message;
  toast.className = `ui-toast show ${type}`;

  setTimeout(() => {
    toast.className = "ui-toast";
  }, 2500);
}

