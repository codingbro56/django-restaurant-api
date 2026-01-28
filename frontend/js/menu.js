fetch(API_BASE_URL + "api/menu/")
  .then(res => res.json())
  .then(items => {
    const grid = document.getElementById("menu-grid");
    grid.innerHTML = "";

    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "menu-card";

      card.innerHTML = `
        ${item.image ? `<img src="${item.image}" />` : ""}
        <h3>${item.name}</h3>
        <div class="category">${item.category_name || ""}</div>
        <div class="price">₹${item.price}</div>
        <button onclick="addToCart(${item.id})">Add to Cart</button>
      `;

      grid.appendChild(card);
    });
  })
  .catch(() => {
    document.getElementById("menu-grid").innerText =
      "Failed to load menu";
  });

function addToCart(itemId) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    window.location.href = "auth/login.html";
    return;
  }

  fetch(API_BASE_URL + "/api/cart/add/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      menu_item_id: itemId,
      quantity: 1
    })
  })
  .then(res => {
    if (!res.ok) throw new Error();
    alert("Item added to cart");
  })
  .catch(() => {
    alert("Failed to add item");
  });
}
