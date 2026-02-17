const categoryBar = document.getElementById("categoryBar");
const menuGrid = document.getElementById("menuGrid");

document.addEventListener("DOMContentLoaded", () => {
  loadCategories();
});

function loadCategories() {
  fetch(API_BASE_URL + "/api/menu/categories/")
    .then(res => res.json())
    .then(categories => {
      categoryBar.innerHTML = "";

      // Add "All" button
      const allBtn = document.createElement("button");
      allBtn.className = "category-btn active";
      allBtn.innerText = "All";
      allBtn.onclick = () => loadMenuItems();
      categoryBar.appendChild(allBtn);

      categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.className = "category-btn";
        btn.innerText = cat.name;
        btn.onclick = () => loadMenuItems(cat.id);
        categoryBar.appendChild(btn);
      });

      loadMenuItems(); // load all initially
    })
    .catch(() => {
      categoryBar.innerHTML = "<p>Failed to load categories</p>";
    });
}

function loadMenuItems(categoryId = null) {
  document.querySelectorAll(".category-btn")
    .forEach(btn => btn.classList.remove("active"));

  if (event?.target) event.target.classList.add("active");

  fetch(API_BASE_URL + "/api/menu/")
    .then(res => res.json())
    .then(items => {
      // Filter out special dishes - only show available items that are NOT special
      const filtered = items
        .filter(i => !i.is_special)
        .filter(i => categoryId ? i.category_id === categoryId : true);

      renderMenuItems(filtered);
    })
    .catch(() => {
      menuGrid.innerHTML = "<p>Error loading menu items</p>";
    });
}

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

// Add item to cart
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


function showToast(message, type = "success") {
  const toast = document.getElementById("ui-toast");
  if (!toast) return;

  toast.textContent = message;
  toast.className = `ui-toast show ${type}`;

  setTimeout(() => {
    toast.className = "ui-toast";
  }, 2500);
}
