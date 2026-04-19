const categoryBar = document.getElementById("categoryBar");
const menuGrid = document.getElementById("menuGrid");

let allMenuItems = [];   // store menu globally
let categoriesData = [];

document.addEventListener("DOMContentLoaded", () => {
  loadCategories();
});


// ============================
// LOAD CATEGORIES
// ============================

function loadCategories() {
  fetch(API_BASE_URL + "/api/menu/categories/")
    .then(res => res.json())
    .then(categories => {

      categoriesData = categories;
      categoryBar.innerHTML = "";

      // ALL button
      const allBtn = document.createElement("button");
      allBtn.className = "category-btn active";
      allBtn.innerText = "All";
      allBtn.onclick = (e) => filterMenu(null, e);
      categoryBar.appendChild(allBtn);

      categories.forEach(cat => {

        const btn = document.createElement("button");
        btn.className = "category-btn";
        btn.innerText = cat.name;

        btn.onclick = (e) => filterMenu(cat.id, e);

        categoryBar.appendChild(btn);

      });

      loadMenuItems();

    })
    .catch(() => {
      categoryBar.innerHTML = "<p>Failed to load categories</p>";
    });
}


// ============================
// LOAD MENU ITEMS (ONLY ONCE)
// ============================

function loadMenuItems() {

  fetch(API_BASE_URL + "/api/menu/")
    .then(res => res.json())
    .then(items => {

      // store globally
      allMenuItems = items.filter(i => !i.is_special);

      renderMenuItems(allMenuItems);

    })
    .catch(() => {
      menuGrid.innerHTML = "<p>Error loading menu items</p>";
    });
}


// ============================
// FILTER MENU BY CATEGORY
// ============================

function filterMenu(categoryId, event) {

  document.querySelectorAll(".category-btn")
    .forEach(btn => btn.classList.remove("active"));

  if (event) {
    event.target.classList.add("active");
  }

  let filtered;

  if (!categoryId) {

    filtered = allMenuItems;

  } else {

    filtered = allMenuItems.filter(item =>
      item.category_id === categoryId
    );

  }

  renderMenuItems(filtered);

}


// ============================
// RENDER MENU
// ============================

function renderMenuItems(items) {

  menuGrid.innerHTML = "";

  if (!items.length) {
    menuGrid.innerHTML = "<p>No items available</p>";
    return;
  }

  items.forEach(item => {

    const imageUrl = item.image
      ? API_BASE_URL + item.image
      : "../assets/images/hero-food.jpg";

    menuGrid.innerHTML += `
      <div class="menu-card">

        <img src="${imageUrl}" alt="${item.name}">

        <h4>${item.name}</h4>

        <p class="desc">${item.description || ""}</p>

        <div class="card-footer">
          <span class="price">₹${item.price}</span>

          <button
            class="add-btn"
            ${item.is_available ? "" : "disabled"}
            onclick="addToCart(${item.id})"
          >
            ${item.is_available ? "Add to Cart" : "Out of Stock"}
          </button>

        </div>

      </div>
    `;
  });

}


// ============================
// ADD TO CART
// ============================

function addToCart(menuItemId) {

  const token = localStorage.getItem("access_token");

  if (!token) {
    window.location.href = "../auth/login.html";
    return;
  }

  fetch(API_BASE_URL + "/api/cart/add/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({
      menu_item: menuItemId,
      quantity: 1
    })
  })
  .then(res => {
    if (!res.ok) throw new Error();
    showToast("Item added to cart", "success");
  })
  .catch(() => {
    showToast("Failed to add item", "error");
  });

}


// ============================
// TOAST
// ============================

function showToast(message, type = "success") {

  const toast = document.getElementById("ui-toast");
  if (!toast) return;

  toast.textContent = message;
  toast.className = `ui-toast show ${type}`;

  setTimeout(() => {
    toast.className = "ui-toast";
  }, 2500);

}