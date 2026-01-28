const token = localStorage.getItem("access_token");

if (!token) {
  window.location.href = "../auth/login.html";
}

fetch(API_BASE_URL + "/api/cart/", {
  headers: {
    "Authorization": "Bearer " + token
  }
})
.then(res => res.json())
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
      <button onclick="removeItem(${item.id})">Remove</button>
    `;

    container.appendChild(div);
  });

  document.getElementById("total").innerText =
    "Total: ₹" + total.toFixed(2);
});

function removeItem(id) {
  fetch(API_BASE_URL + `/api/cart/remove/${id}/`, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + token
    }
  }).then(() => location.reload());
}

function placeOrder() {
  fetch(API_BASE_URL + "api/orders/place/", {   
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token
    }
  })
  .then(res => res.json())
  .then(() => {
    window.location.href = "../orders/success.html";
  });
}
