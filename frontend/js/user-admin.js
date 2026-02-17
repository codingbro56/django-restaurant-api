// ===============================
// USER ADMIN MANAGEMENT
// ===============================

function getAdminToken() {
  return localStorage.getItem("admin_token");
}

function handleAuthError(status) {
  if (status === 401) {
    localStorage.removeItem("admin_token");
    window.location.href = "login.html";
  }
}

function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  if (!toast) {
    // Fallback: create temp element if toast doesn't exist
    const temp = document.createElement("div");
    temp.style.cssText = "position:fixed;top:20px;right:20px;padding:12px 20px;background:#333;color:#fff;border-radius:8px;z-index:9999;";
    temp.innerText = message;
    document.body.appendChild(temp);
    setTimeout(() => temp.remove(), 3000);
    return;
  }

  toast.innerText = message;
  toast.className = "toast" + (isError ? " error" : "");
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

// ===============================
// LOAD USERS
// ===============================
function loadUsers() {
  const token = getAdminToken();
  if (!token) return;

  const table = document.getElementById("userTable");
  if (!table) return;

  table.innerHTML = "<tr><td colspan='6'>Loading...</td></tr>";

  fetch(API_BASE_URL + "/api/admin/users/", {
    headers: { Authorization: "Bearer " + token }
  })
    .then(res => {
      if (!res.ok) {
        handleAuthError(res.status);
        return Promise.reject(new Error("Failed to load users"));
      }
      return res.json();
    })
    .then(data => {
      table.innerHTML = "";

      if (!data || data.length === 0) {
        table.innerHTML = "<tr><td colspan='6'>No users found</td></tr>";
        return;
      }

      data.forEach(user => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${user.id}</td>
          <td>${user.username}</td>
          <td>${user.email || "-"}</td>
          <td>${user.is_active ? "Active" : "Disabled"}</td>
          <td>${user.is_staff ? "Admin" : "User"}</td>
          <td>
            <button class="edit-user-btn" data-id="${user.id}" data-email="${user.email || ""}" data-is-staff="${user.is_staff}">Edit</button>
            ${user.is_active ? `<button class="disable-user-btn" data-id="${user.id}">Disable</button>` : "-"}
          </td>
        `;
        table.appendChild(row);
      });

      attachUserListeners();
    })
    .catch(err => {
      table.innerHTML = "<tr><td colspan='6'>Failed to load users</td></tr>";
      console.warn("[user-admin] loadUsers error:", err && err.message ? err.message : err);
    });
}

// ===============================
// CREATE USER
// ===============================
function createUser() {
  const token = getAdminToken();
  if (!token) return;

  const usernameEl = document.getElementById("newUsername");
  const emailEl = document.getElementById("newEmail");
  const passwordEl = document.getElementById("newPassword");
  const isStaffEl = document.getElementById("newIsStaff");

  const username = usernameEl ? usernameEl.value.trim() : "";
  const email = emailEl ? emailEl.value.trim() : "";
  const password = passwordEl ? passwordEl.value : "";
  const isStaff = isStaffEl ? isStaffEl.checked : false;

  if (!username || !password) {
    showToast("Username and password required", true);
    return;
  }

  fetch(API_BASE_URL + "/api/admin/users/create/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({
      username,
      email: email || null,
      password,
      is_staff: isStaff
    })
  })
    .then(res => {
      if (!res.ok) {
        handleAuthError(res.status);
        return res.json().then(d => Promise.reject(new Error(d && d.error ? d.error : "Create failed")));
      }
      return res.json();
    })
    .then(data => {
      if (data && data.error) {
        showToast(data.error, true);
        return;
      }

      showToast("User created");
      if (usernameEl) usernameEl.value = "";
      if (emailEl) emailEl.value = "";
      if (passwordEl) passwordEl.value = "";
      if (isStaffEl) isStaffEl.checked = false;
      loadUsers();
    })
    .catch(err => {
      showToast(err && err.message ? err.message : "Create user failed", true);
      console.warn("[user-admin] createUser error:", err && err.message ? err.message : err);
    });
}

// ===============================
// EDIT USER
// ===============================
function editUser(userId, currentEmail, currentIsStaff) {
  const token = getAdminToken();
  if (!token) return;

  const newEmail = prompt("Enter new email:", currentEmail);
  if (newEmail === null) return;

  const makeAdmin = confirm(
    currentIsStaff
      ? "User is admin. Remove admin role?"
      : "Make this user admin?"
  );

  fetch(API_BASE_URL + "/api/admin/users/" + userId + "/", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({
      email: newEmail,
      is_staff: makeAdmin
    })
  })
    .then(res => {
      if (!res.ok) {
        handleAuthError(res.status);
        return res.json().then(d => Promise.reject(new Error(d && d.error ? d.error : "Update failed")));
      }
      return res.json();
    })
    .then(data => {
      if (data && data.error) {
        showToast(data.error, true);
        return;
      }

      showToast("User updated");
      loadUsers();
    })
    .catch(err => {
      showToast(err && err.message ? err.message : "Update user failed", true);
      console.warn("[user-admin] editUser error:", err && err.message ? err.message : err);
    });
}

// ===============================
// DISABLE USER
// ===============================
function disableUser(userId) {
  const token = getAdminToken();
  if (!token) return;

  if (!confirm("Disable this user?")) return;

  fetch(API_BASE_URL + "/api/admin/users/" + userId + "/disable/", {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token }
  })
    .then(res => {
      if (!res.ok) {
        handleAuthError(res.status);
        return Promise.reject(new Error("Disable failed"));
      }
      return res.json();
    })
    .then(() => {
      showToast("User disabled");
      loadUsers();
    })
    .catch(err => {
      showToast(err && err.message ? err.message : "Disable user failed", true);
      console.warn("[user-admin] disableUser error:", err && err.message ? err.message : err);
    });
}

// ===============================
// ATTACH EVENT LISTENERS
// ===============================
function attachUserListeners() {
  document.querySelectorAll(".edit-user-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const email = btn.getAttribute("data-email");
      const isStaff = btn.getAttribute("data-is-staff") === "true";
      editUser(id, email, isStaff);
    });
  });

  document.querySelectorAll(".disable-user-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      disableUser(id);
    });
  });
}

// ===============================
// ATTACH CREATE BUTTON
// ===============================
function attachCreateListener() {
  const createBtn = document.getElementById("createUserBtn");
  if (createBtn) {
    createBtn.addEventListener("click", createUser);
  }
}

// ===============================
// INITIALIZE
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  loadUsers();
  attachCreateListener();
});

