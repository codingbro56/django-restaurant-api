// ===============================
// ADMIN MENU MANAGEMENT SCRIPT
// ===============================

// Ensure only admin can access this page
checkAdmin();


// ===============================
// LOAD CATEGORIES
// - Used in 2 places:
//   1) Dropdown while adding menu item
//   2) Category management (delete)
// ===============================
function loadCategories() {
    const select = document.getElementById("categorySelect");
    const list = document.getElementById("categoryList");

    if (!select || !list) return;

    fetch(API_BASE_URL + "/api/menu/categories/", {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("admin_token")
        }
    })
    .then(res => res.json())
    .then(categories => {
        // Reset dropdown (used while adding menu item)
        select.innerHTML = '<option value="">Select Category</option>';

        // Reset category list (used for delete)
        list.innerHTML = "";

        categories.forEach(cat => {
            // Dropdown option
            select.innerHTML += `
                <option value="${cat.id}">
                    ${cat.name}
                </option>
            `;

            // Category list with delete button
            list.innerHTML += `
                <div class="category-row">
                    <span>${cat.name}</span>
                    <button onclick="deleteCategory(${cat.id})">
                        Delete
                    </button>
                </div>
            `;
        });
    });
}


// ===============================
// ADD CATEGORY
// ===============================
function addCategory() {
    fetch(API_BASE_URL + "/api/menu/categories/add/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("admin_token")
        },
        body: JSON.stringify({
            name: catName.value
        })
    })
    .then(() => loadCategories());
}


// ===============================
// DELETE CATEGORY
// - Backend prevents deletion if menu items exist
// ===============================
function deleteCategory(id) {
    if (!confirm("Delete this category?")) return;

    fetch(API_BASE_URL + "/api/menu/categories/" + id + "/delete/", {
        method: "DELETE",
        headers: {
            Authorization: "Bearer " + localStorage.getItem("admin_token")
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
            return;
        }
        loadCategories();
        loadMenuItems(); // refresh menu list if category affects items
    });
}


// ===============================
// LOAD MENU ITEMS (ADMIN)
// ===============================
function loadMenuItems() {
    const box = document.getElementById("menuList");
    if (!box) return;

    fetch(API_BASE_URL + "/api/menu/admin/items/", {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("admin_token")
        }
    })
    .then(res => res.json())
    .then(items => {
        box.innerHTML = "";

        items.forEach(i => {
            box.innerHTML += `
                <div style="margin-bottom:10px">
                    ${i.name} – ₹${i.price} (${i.category})
                    [${i.is_available ? "Available" : "Hidden"}]
                    <br>
                    <button onclick="editMenuItem(${i.id}, ${i.price}, ${i.is_available})">
                        Edit
                    </button>
                    <button onclick="deleteMenuItem(${i.id})">
                        Delete
                    </button>
                </div>
            `;
        });
    });
}


// ===============================
// ADD MENU ITEM
// - Prevents add without category
// - Backend prevents duplicate items
// ===============================
function addMenuItem() {
    if (!categorySelect.value) {
        alert("Please select a category");
        return;
    }

    fetch(API_BASE_URL + "/api/menu/admin/items/add/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("admin_token")
        },
        body: JSON.stringify({
            name: itemName.value,
            price: itemPrice.value,
            category: categorySelect.value
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
            return;
        }
        loadMenuItems();
    });
}


// ===============================
// EDIT MENU ITEM
// - Update price
// - Toggle availability
// ===============================
function editMenuItem(id, price, isAvailable) {
    const newPrice = prompt("Enter new price", price);
    if (newPrice === null) return;

    const toggle = confirm(
        "Click OK to make AVAILABLE\nCancel to make HIDDEN"
    );

    fetch(API_BASE_URL + "/api/menu/admin/items/" + id + "/", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("admin_token")
        },
        body: JSON.stringify({
            price: parseFloat(newPrice),
            is_available: toggle
        })
    })
    .then(() => loadMenuItems());
}


// ===============================
// DELETE MENU ITEM
// ===============================
function deleteMenuItem(id) {
    if (!confirm("Delete this item?")) return;

    fetch(API_BASE_URL + "/api/menu/admin/" + id + "/delete/", {
        method: "DELETE",
        headers: {
            Authorization: "Bearer " + localStorage.getItem("admin_token")
        }
    })
    .then(() => loadMenuItems());
}


// ===============================
// INITIAL PAGE LOAD
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    loadCategories();
    loadMenuItems();
});
