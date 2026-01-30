const token = localStorage.getItem("access_token");

if (!token) {
  window.location.href = "../auth/login.html";
}

// LOAD CART
fetch(API_BASE_URL + "/api/cart/", {
  headers: {
    "Authorization": "Bearer " + token
  }
})
.then(res => {
  if (!res.ok) throw new Error("Failed to load cart");
  return res.json();
})
.then(data => {
  const container = document.getElementById("cart-items");
  let total = 0;

  container.innerHTML = "";

  if (!data.items || data.items.length === 0) {
    container.innerText = "Your cart is empty";
    return;
  }

  data.items.forEach(item => {
    total += Number(item.total_price);

    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <h4>${item.menu_item.name}</h4>
      <p>₹${item.total_price}</p>
      <button onclick="removeItem(${item.menu_item.id})">
        Remove
      </button>
    `;

    container.appendChild(div);
  });

  document.getElementById("total").innerText =
    "Total: ₹" + total.toFixed(2);
})
.catch(err => {
  console.error("CART LOAD ERROR:", err);
  document.getElementById("cart-items").innerText =
    "Failed to load cart";
});


// REMOVE ITEM (by menu_item_id)
function removeItem(menuItemId) {
  fetch(API_BASE_URL + `/api/cart/remove/${menuItemId}/`, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + token
    }
  })
  .then(res => {
    if (!res.ok) throw new Error("Remove failed");
    location.reload();
  })
  .catch(err => {
    console.error("REMOVE ERROR:", err);
    alert("Failed to remove item");
  });
}


// PLACE ORDER
function placeOrder() {
  fetch(API_BASE_URL + "/api/orders/place/", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token
    }
  })
  .then(res => {
    if (!res.ok) throw new Error("Order failed");
    return res.json();
  })
  .then(() => {
    window.location.href = "../orders/success.html";
  })
  .catch(err => {
    console.error("ORDER ERROR:", err);
    alert("Order could not be placed");
  });
}


function clearCart() {
  if (!confirm("Clear all items from cart?")) return;

  fetch(API_BASE_URL + "/api/cart/clear/", {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + token
    }
  })
  .then(res => {
    if (!res.ok) throw new Error("Clear failed");
    location.reload();
  })
  .catch(err => {
    console.error("CLEAR CART ERROR:", err);
    alert("Failed to clear cart");
  });
}
