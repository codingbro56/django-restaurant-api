// ========================================
// ADMIN USER MANAGEMENT (MASTER-DETAIL)
// ========================================

const token = localStorage.getItem("admin_token");
if (!token) {
  window.location.href = "login.html";
}

// ===============================
// UTIL
// ===============================
function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.className = "toast" + (isError ? " error" : "");
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

function apiFetch(url, options = {}) {
  return fetch(API_BASE_URL + url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
      ...(options.headers || {})
    }
  }).then(res => {
    if (res.status === 401) {
      localStorage.removeItem("admin_token");
      window.location.href = "login.html";
    }
    return res.json().then(data => {
      if (!res.ok) {
        throw new Error(data.message || "API Error");
      }
      return data;
    });
  });
}

// ===============================
// LOAD ADMIN LIST
// ===============================
function loadAdmins() {
  const tbody = document.getElementById("adminTableBody");
  tbody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

  apiFetch("/api/admin/users/")
    .then(data => {
      tbody.innerHTML = "";

      if (!data || data.length === 0) {
        tbody.innerHTML = "<tr><td colspan='5'>No users found</td></tr>";
        return;
      }

      data.forEach(admin => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${admin.id}</td>
          <td>${admin.full_name || "-"}</td>
          <td>${admin.username}</td>
          <td>${admin.is_active ? "Active" : "Disabled"}</td>
          <td>${admin.is_staff ? "Admin" : "User"}</td>
        `;

        row.addEventListener("click", () => {

          // Remove previous selection
          document.querySelectorAll("#adminTableBody tr")
            .forEach(r => r.classList.remove("selected"));

          // Add selected class
          row.classList.add("selected");

          selectAdmin(admin.id);
        });

        tbody.appendChild(row);
      });
    })
    .catch(() => {
      tbody.innerHTML = "<tr><td colspan='5'>Failed to load</td></tr>";
    });
}

// ===============================
// LOAD ADMIN DETAIL
// ===============================
let selectedAdminId = null;

function selectAdmin(id) {
  selectedAdminId = id;

  // Show loading state (optional but good UX)
  document.getElementById("emptyState").classList.add("hidden");
  document.getElementById("detailContent").classList.remove("hidden");
  // document.getElementById("detailContent").innerHTML = "Loading..."; 

  apiFetch(`/api/admin/users/${id}/detail/`)
    .then(admin => {

      // Fill data
      document.getElementById("detail_full_name").value = admin.full_name || "";
      document.getElementById("detail_username").value = admin.username || "";
      document.getElementById("detail_email").value = admin.email || "";
      document.getElementById("detail_phone_no").value = admin.phone_no || "";
      document.getElementById("detail_address").value = admin.address || "";
      document.getElementById("detail_city").value = admin.city || "";
      document.getElementById("detail_state").value = admin.state || "";
      document.getElementById("detail_pincode").value = admin.pincode || "";
      document.getElementById("detail_is_active").checked = admin.is_active;
    })
    .catch(() => {
      showToast("Failed to load admin details", true);

      // revert UI if failed
      document.getElementById("emptyState").classList.remove("hidden");
      document.getElementById("detailContent").classList.add("hidden");
    });
}

// ===============================
// EDIT / SAVE
// ===============================
const editBtn = document.getElementById("editAdminBtn");
const saveBtn = document.getElementById("saveAdminBtn");

editBtn.addEventListener("click", () => {
  toggleEdit(true);
});

saveBtn.addEventListener("click", () => {
  saveAdmin();
});

function toggleEdit(enable) {
  const inputs = document.querySelectorAll("#detailContent input");
  inputs.forEach(input => {
    if (input.id !== "detail_username") {
      input.disabled = !enable;
    }
  });

  editBtn.classList.toggle("hidden", enable);
  saveBtn.classList.toggle("hidden", !enable);
}

function saveAdmin() {
  if (!selectedAdminId) return;

  const payload = {
    full_name: document.getElementById("detail_full_name").value,
    email: document.getElementById("detail_email").value,
    phone_no: document.getElementById("detail_phone_no").value,
    address: document.getElementById("detail_address").value,
    city: document.getElementById("detail_city").value,
    state: document.getElementById("detail_state").value,
    pincode: document.getElementById("detail_pincode").value,
    is_active: document.getElementById("detail_is_active").checked
  };

  apiFetch(`/api/admin/users/${selectedAdminId}/update/`, {
    method: "PUT",
    body: JSON.stringify(payload)
  })
    .then(() => {
      showToast("Admin updated");
      toggleEdit(false);
      loadAdmins();
    })
    .catch(() => showToast("Update failed", true));
}

// ===============================
// DEACTIVATE
// ===============================
document.getElementById("disableAdminBtn")
  .addEventListener("click", () => {
    if (!selectedAdminId) return;

    apiFetch(`/api/admin/users/${selectedAdminId}/disable/`, {
      method: "DELETE"
    })
      .then(data => {
        showToast(data.message);
        loadAdmins();
      })
      .catch(() => showToast("Failed to deactivate", true));
  });

// ===============================
// CREATE DRAWER
// ===============================
const drawer = document.getElementById("createAdminDrawer");

document.getElementById("openCreateDrawerBtn")
  .addEventListener("click", () => {
    drawer.classList.remove("hidden");
  });

document.getElementById("closeDrawerBtn")
  .addEventListener("click", () => {
    drawer.classList.add("hidden");
  });

document.getElementById("cancelCreateBtn")
  .addEventListener("click", () => {
    drawer.classList.add("hidden");
  });

document.getElementById("createAdminBtn")
  .addEventListener("click", () => {
    const payload = {
      full_name: document.getElementById("create_full_name").value,
      username: document.getElementById("create_username").value,
      email: document.getElementById("create_email").value,
      phone_no: document.getElementById("create_phone_no").value,
      address: document.getElementById("create_address").value,
      city: document.getElementById("create_city").value,
      state: document.getElementById("create_state").value,
      pincode: document.getElementById("create_pincode").value,
      password: document.getElementById("create_password").value
    };

    apiFetch("/api/admin/users/create/", {
      method: "POST",
      body: JSON.stringify(payload)
    })
      .then(() => {
        showToast("Admin created");
        drawer.classList.add("hidden");
        loadAdmins();
      })
      .catch(() => showToast("Create failed", true));
  });

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  loadAdmins();
});

document.getElementById("searchInput").addEventListener("input", function () {
  const value = this.value.toLowerCase();
  const rows = document.querySelectorAll("#adminTableBody tr");

  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(value) ? "" : "none";
  });
});