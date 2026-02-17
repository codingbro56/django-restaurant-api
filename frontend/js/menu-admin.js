// ===============================
// ADMIN MENU MANAGEMENT SCRIPT
// ===============================

function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.innerText = message;
  toast.className = "toast" + (isError ? " error" : "");
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

function getAdminToken() {
  return localStorage.getItem("admin_token");
}

function handleAuthError(status) {
  if (status === 401) {
    localStorage.removeItem("admin_token");
    window.location.href = "login.html";
  }
}

let editingItemId = null;

// ===============================
// LOAD CATEGORIES
// ===============================
function loadCategories() {
  const token = getAdminToken();
  if (!token) return;

  const addSelect = document.getElementById("itemCategory");
  const deleteSelect = document.getElementById("deleteCategory");

  fetch(API_BASE_URL + "/api/menu/admin/categories/", {
    headers: { Authorization: "Bearer " + token }
  })
    .then(res => {
      if (!res.ok) {
        handleAuthError(res.status);
        return Promise.reject(new Error("Failed to load categories"));
      }
      return res.json();
    })
    .then(categories => {
      if (!addSelect || !deleteSelect) return;
      addSelect.innerHTML = `<option value="">Select category</option>`;
      deleteSelect.innerHTML = `<option value="">Delete category</option>`;

      categories.forEach(cat => {
        addSelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        deleteSelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
      });
    })
    .catch(err => {
      console.warn("[menu-admin] loadCategories error:", err && err.message ? err.message : err);
    });
}

// ===============================
// ADD CATEGORY
// ===============================
function addCategory() {
  const token = getAdminToken();
  if (!token) return;

  const catNameEl = document.getElementById("catName");
  const name = catNameEl ? catNameEl.value.trim() : "";
  
  if (!name) {
    showToast("Category name required", true);
    return;
  }

  fetch(API_BASE_URL + "/api/menu/admin/categories/add/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ name })
  })
    .then(res => {
      if (!res.ok) {
        handleAuthError(res.status);
        return Promise.reject(new Error("Failed to add category"));
      }
      return res.json();
    })
    .then(() => {
      if (catNameEl) catNameEl.value = "";
      showToast("Category added");
      loadCategories();
    })
    .catch(err => {
      showToast("Add category failed", true);
      console.warn("[menu-admin] addCategory error:", err && err.message ? err.message : err);
    });
}

// ===============================
// DELETE CATEGORY
// ===============================
function deleteCategory() {
  const token = getAdminToken();
  if (!token) return;

  const deleteSelect = document.getElementById("deleteCategory");
  const id = deleteSelect ? deleteSelect.value : "";

  if (!id) {
    showToast("Select a category", true);
    return;
  }

  if (!confirm("Delete this category?")) return;

  fetch(API_BASE_URL + `/api/menu/admin/categories/${id}/delete/`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token }
  })
    .then(res => {
      if (!res.ok) {
        handleAuthError(res.status);
        return Promise.reject(new Error("Delete failed"));
      }
      return res.json();
    })
    .then(data => {
      if (data && data.error) {
        showToast(data.error, true);
        return;
      }
      showToast("Category deleted");
      loadCategories();
      loadMenuItems();
    })
    .catch(err => {
      showToast("Delete category failed", true);
      console.warn("[menu-admin] deleteCategory error:", err && err.message ? err.message : err);
    });
}

// ===============================
// LOAD MENU ITEMS
// ===============================
function loadMenuItems() {
  const token = getAdminToken();
  if (!token) return;

  fetch(API_BASE_URL + "/api/menu/admin/items/", {
    headers: { Authorization: "Bearer " + token }
  })
    .then(res => {
      if (!res.ok) {
        handleAuthError(res.status);
        return Promise.reject(new Error("Failed to load items"));
      }
      return res.json();
    })
    .then(items => {
      const grid = document.getElementById("menuGrid");
      if (!grid) return;

      grid.innerHTML = "";

      items.forEach(item => {
        const card = document.createElement("div");
        card.className = "menu-card";

        const imageUrl = item.image
          ? API_BASE_URL + item.image
          : "../assets/images/food-placeholder.png";

        card.innerHTML = `
          <img src="${imageUrl}" alt="${item.name}">
          <h4>${item.name}</h4>
          <p>₹${item.price}</p>

          <div class="special-controls">
            <label>
              <input
                type="checkbox"
                ${item.is_special ? "checked" : ""}
                class="special-checkbox"
                data-item-id="${item.id}"
              />
              Special Dish
            </label>

            <select class="special-day-select" data-item-id="${item.id}">
              <option value="">Auto (None)</option>
              <option value="0" ${item.special_day === 0 ? "selected" : ""}>Monday</option>
              <option value="1" ${item.special_day === 1 ? "selected" : ""}>Tuesday</option>
              <option value="2" ${item.special_day === 2 ? "selected" : ""}>Wednesday</option>
              <option value="3" ${item.special_day === 3 ? "selected" : ""}>Thursday</option>
              <option value="4" ${item.special_day === 4 ? "selected" : ""}>Friday</option>
              <option value="5" ${item.special_day === 5 ? "selected" : ""}>Saturday</option>
              <option value="6" ${item.special_day === 6 ? "selected" : ""}>Sunday</option>
            </select>
          </div>

          <div class="item-actions">
            <button class="edit-btn" data-item-id="${item.id}" data-name="${item.name}" data-price="${item.price}">Edit</button>
            <button class="danger delete-btn" data-item-id="${item.id}">Delete</button>
          </div>
        `;

        grid.appendChild(card);
      });

      attachItemEventListeners();
    })
    .catch(err => {
      console.warn("[menu-admin] loadMenuItems error:", err && err.message ? err.message : err);
    });
}

// ===============================
// ADD MENU ITEM
// ===============================
function addMenuItem() {
  const token = getAdminToken();
  if (!token) return;

  const itemNameEl = document.getElementById("itemName");
  const itemPriceEl = document.getElementById("itemPrice");
  const itemCategoryEl = document.getElementById("itemCategory");
  const itemImageEl = document.getElementById("itemImage");

  const name = itemNameEl ? itemNameEl.value.trim() : "";
  const price = itemPriceEl ? itemPriceEl.value : "";
  const category = itemCategoryEl ? itemCategoryEl.value : "";
  const image = itemImageEl ? itemImageEl.files[0] : null;

  if (!name || !price || !category) {
    showToast("Name, price and category are required", true);
    return;
  }

  const fd = new FormData();
  fd.append("name", name);
  fd.append("price", price);
  fd.append("category", category);
  if (image) fd.append("image", image);

  fetch(API_BASE_URL + "/api/menu/admin/items/add/", {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
    body: fd
  })
    .then(res => {
      if (!res.ok) {
        handleAuthError(res.status);
        return Promise.reject(new Error("Failed to add item"));
      }
      return res.json();
    })
    .then(() => {
      if (itemNameEl) itemNameEl.value = "";
      if (itemPriceEl) itemPriceEl.value = "";
      if (itemCategoryEl) itemCategoryEl.value = "";
      if (itemImageEl) itemImageEl.value = "";
      showToast("Menu item added");
      loadMenuItems();
    })
    .catch(err => {
      showToast("Add item failed", true);
      console.warn("[menu-admin] addMenuItem error:", err && err.message ? err.message : err);
    });
}

// ===============================
// EDIT MODAL LOGIC
// ===============================
function openEditModal(id, name, price) {
  editingItemId = id;
  const editNameEl = document.getElementById("editName");
  const editPriceEl = document.getElementById("editPrice");
  const editImageEl = document.getElementById("editImage");

  if (editNameEl) editNameEl.value = name;
  if (editPriceEl) editPriceEl.value = price;
  if (editImageEl) editImageEl.value = "";

  const modal = document.getElementById("editModal");
  if (modal) modal.style.display = "flex";
}

function closeEditModal() {
  editingItemId = null;
  const modal = document.getElementById("editModal");
  if (modal) modal.style.display = "none";
}

// ===============================
// UPDATE MENU ITEM
// ===============================
function updateMenuItem() {
  const token = getAdminToken();
  if (!token || !editingItemId) return;

  const editNameEl = document.getElementById("editName");
  const editPriceEl = document.getElementById("editPrice");
  const editImageEl = document.getElementById("editImage");

  const fd = new FormData();
  fd.append("name", editNameEl ? editNameEl.value.trim() : "");
  fd.append("price", editPriceEl ? editPriceEl.value : "");
  if (editImageEl && editImageEl.files[0]) {
    fd.append("image", editImageEl.files[0]);
  }

  fetch(API_BASE_URL + `/api/menu/admin/items/${editingItemId}/`, {
    method: "PATCH",
    headers: { Authorization: "Bearer " + token },
    body: fd
  })
    .then(res => {
      if (!res.ok) {
        handleAuthError(res.status);
        return Promise.reject(new Error("Update failed"));
      }
      return res.json();
    })
    .then(() => {
      closeEditModal();
      showToast("Item updated");
      loadMenuItems();
    })
    .catch(err => {
      showToast("Update failed", true);
      console.warn("[menu-admin] updateMenuItem error:", err && err.message ? err.message : err);
    });
}

// ===============================
// DELETE MENU ITEM
// ===============================
function deleteMenuItem(id) {
  if (!confirm("Delete this item?")) return;

  const token = getAdminToken();
  if (!token) return;

  fetch(API_BASE_URL + `/api/menu/admin/items/${id}/delete/`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token }
  })
    .then(res => {
      if (!res.ok) {
        handleAuthError(res.status);
        return Promise.reject(new Error("Delete failed"));
      }
      return res.json();
    })
    .then(() => {
      showToast("Item deleted");
      loadMenuItems();
    })
    .catch(err => {
      showToast("Delete failed", true);
      console.warn("[menu-admin] deleteMenuItem error:", err && err.message ? err.message : err);
    });
}

// ===============================
// TOGGLE SPECIAL
// ===============================
function toggleSpecial(itemId, isChecked) {
  const token = getAdminToken();
  if (!token) return;

  fetch(API_BASE_URL + `/api/menu/admin/items/${itemId}/special/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ is_special: isChecked })
  })
    .then(res => {
      if (!res.ok) {
        handleAuthError(res.status);
        return Promise.reject(new Error("Failed"));
      }
      return res.json();
    })
    .then(() => {
      loadMenuItems();
    })
    .catch(err => {
      console.warn("[menu-admin] toggleSpecial error:", err && err.message ? err.message : err);
    });
}

// ===============================
// SET SPECIAL DAY
// ===============================
function setSpecialDay(itemId, day) {
  const token = getAdminToken();
  if (!token) return;

  fetch(API_BASE_URL + `/api/menu/admin/items/${itemId}/special/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ special_day: day === "" ? null : parseInt(day) })
  })
    .then(res => {
      if (!res.ok) {
        handleAuthError(res.status);
        return Promise.reject(new Error("Failed"));
      }
      return res.json();
    })
    .then(() => {
      loadMenuItems();
    })
    .catch(err => {
      console.warn("[menu-admin] setSpecialDay error:", err && err.message ? err.message : err);
    });
}

// ===============================
// ATTACH EVENT LISTENERS
// ===============================
function attachItemEventListeners() {
  // Edit buttons
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-item-id");
      const name = btn.getAttribute("data-name");
      const price = btn.getAttribute("data-price");
      openEditModal(id, name, price);
    });
  });

  // Delete buttons
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-item-id");
      deleteMenuItem(id);
    });
  });

  // Special checkboxes
  document.querySelectorAll(".special-checkbox").forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      const id = checkbox.getAttribute("data-item-id");
      toggleSpecial(id, checkbox.checked);
    });
  });

  // Special day selects
  document.querySelectorAll(".special-day-select").forEach(select => {
    select.addEventListener("change", () => {
      const id = select.getAttribute("data-item-id");
      setSpecialDay(id, select.value);
    });
  });
}

// ===============================
// ATTACH FORM LISTENERS
// ===============================
function attachFormListeners() {
  const addCatBtn = document.getElementById("addCategoryBtn");
  const deleteCatBtn = document.getElementById("deleteCategoryBtn");
  const addItemBtn = document.getElementById("addMenuItemBtn");
  const cancelBtn = document.getElementById("cancelEditBtn");
  const updateBtn = document.getElementById("updateMenuItemBtn");
  const logoutLink = document.getElementById("logoutLink");

  if (addCatBtn) addCatBtn.addEventListener("click", addCategory);
  if (deleteCatBtn) deleteCatBtn.addEventListener("click", deleteCategory);
  if (addItemBtn) addItemBtn.addEventListener("click", addMenuItem);
  if (cancelBtn) cancelBtn.addEventListener("click", closeEditModal);
  if (updateBtn) updateBtn.addEventListener("click", updateMenuItem);
  if (logoutLink) {
    logoutLink.removeAttribute("href");
    logoutLink.addEventListener("click", e => {
      e.preventDefault();
      adminLogout();
    });
  }
}

// ===============================
// FETCH INITIAL DATA
// ===============================
function fetchInitialData() {
  const token = getAdminToken();
  if (!token) {
    console.warn("[menu-admin] No admin token found");
    return;
  }
  loadCategories();
  loadMenuItems();
}

// ===============================
// ATTACH EVENTS
// ===============================
function attachEvents() {
  attachFormListeners();
  attachItemEventListeners();
}

// ===============================
// INITIALIZE PAGE
// ===============================
function initPage() {
  attachEvents();
  fetchInitialData();
}

// ===============================
// READY
// ===============================
document.addEventListener("DOMContentLoaded", initPage);
