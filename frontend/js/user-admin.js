// const API_BASE = "/api/admin/";
const token = localStorage.getItem("access_token"); // or session-based

function authHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    };
}

// READ — Load users
function loadUsers() {
    fetch(API_BASE_URL + "/api/admin/users/", {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("admin_token")
        }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error("Failed to load users");
        }
        return res.json();
    })
    .then(data => {
        const table = document.getElementById("userTable");
        table.innerHTML = "";

        if (!data || data.length === 0) {
            table.innerHTML =
                "<tr><td colspan='6'>No users found</td></tr>";
            return;
        }

        data.forEach(user => {
            table.innerHTML += `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.email || "-"}</td>
                    <td>${user.is_active ? "Active" : "Disabled"}</td>
                    <td>${user.is_staff ? "Admin" : "User"}</td>
                    <td>
                        <button onclick="editUser(${user.id}, '${user.email}', ${user.is_staff})">
                            Edit
                        </button>
                        ${
                          user.is_active
                          ? `<button onclick="disableUser(${user.id})">Disable</button>`
                          : "-"
                        }
                    </td>
                </tr>
            `;
        });
    })
    .catch(err => {
        console.error(err);
    });
}

document.addEventListener("DOMContentLoaded", loadUsers);


// CREATE — Add user
function createUser() {
    const username = document.getElementById("newUsername").value.trim();
    const email = document.getElementById("newEmail").value.trim();
    const password = document.getElementById("newPassword").value;
    const isStaff = document.getElementById("newIsStaff").checked;

    if (!username || !password) {
        alert("Username and password are required");
        return;
    }

    fetch(API_BASE_URL + "/api/admin/users/create/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("admin_token")
        },
        body: JSON.stringify({
            username: username,
            email: email,
            password: password,
            is_staff: isStaff
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
            return;
        }

        alert("User created");
        loadUsers();   // refresh table

        // clear form
        document.getElementById("newUsername").value = "";
        document.getElementById("newEmail").value = "";
        document.getElementById("newPassword").value = "";
        document.getElementById("newIsStaff").checked = false;
    })
    .catch(() => {
        alert("Failed to create user");
    });
}

// Edit User
function editUser(userId, currentEmail, currentIsStaff) {
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
            Authorization: "Bearer " + localStorage.getItem("admin_token")
        },
        body: JSON.stringify({
            email: newEmail,
            is_staff: makeAdmin
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
            return;
        }

        alert("User updated");
        loadUsers();
    })
    .catch(() => {
        alert("Failed to update user");
    });
}


// DELETE — Disable user (soft delete)
function disableUser(userId) {
    console.log("Disable clicked for user:", userId);

    if (!confirm("Disable this user?")) return;

    fetch(API_BASE_URL + "/api/admin/users/" + userId + "/disable/", {
        method: "DELETE",
        headers: {
            Authorization: "Bearer " + localStorage.getItem("admin_token")
        }
    })
    .then(res => {
        console.log("Disable response status:", res.status);
        if (!res.ok) {
            throw new Error("Disable failed");
        }
        return res.json();
    })
    .then(data => {
        console.log("Disable success:", data);
        alert("User disabled");
        loadUsers();
    })
    .catch(err => {
        console.error("Disable error:", err);
        alert("Disable failed – check console");
    });
}

