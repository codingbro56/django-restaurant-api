function adminLogin() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const result = document.getElementById("result");

    fetch(API_BASE_URL + "/api/auth/token-login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.access) {
            result.innerText = "Invalid credentials";
            return;
        }

        // Store token first
        localStorage.setItem("admin_token", data.access);

        // VERIFY ADMIN ROLE
        return fetch(API_BASE_URL + "/api/auth/me/", {
            headers: {
                Authorization: "Bearer " + data.access
            }
        });
    })
    .then(res => res.json())
    .then(user => {
        if (!user.is_staff) {
            result.innerText = "Admin access required";
            localStorage.removeItem("admin_token");
            return;
        }

        // ✅ ADMIN VERIFIED
        window.location.href = "dashboard.html";
    })
    .catch(() => {
        result.innerText = "Login failed";
    });
}


// STRICT ADMIN CHECK (USE ON ALL ADMIN PAGES)
function checkAdmin() {
    // ⛔ DO NOT check admin on login page
    if (window.location.pathname.includes("login.html")) {
        return;
    }

    const token = localStorage.getItem("admin_token");
    if (!token) {
        window.location.href = "login.html";
    }
}


function adminLogout() {
    localStorage.removeItem("admin_token");
    window.location.href = "login.html";
}


checkAdmin();

// Load admin dashboard stats
function loadAdminDashboard() {
    fetch(API_BASE_URL + "/api/admin/dashboard/", {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("admin_token")
        }
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("usersCount").innerText = data.total_users;
        document.getElementById("ordersCount").innerText = data.total_orders;
        document.getElementById("menuCount").innerText = data.total_menu_items;
        document.getElementById("categoryCount").innerText = data.total_categories;
    });
}

document.addEventListener("DOMContentLoaded", loadAdminDashboard);
