function registerUser() {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirm = document.getElementById("confirm_password").value.trim();
    const result = document.getElementById("result");

    if (password !== confirm) {
        result.innerText = "Passwords do not match";
        return;
    }

    fetch(API_BASE_URL + "/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username,
            email,
            password,
            confirm_password: confirm
        })
    })
    .then(res => {
        if (!res.ok) throw new Error("Register failed");
        return res.json();
    })
    .then(() => {
        window.location.href = "../auth/login.html";
    })
    .catch(err => {
        result.innerText = "Registration failed";
        console.error(err);
    });
}

function loginUser() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const result = document.getElementById("result");

    if (!username || !password) {
        result.innerText = "Please enter username and password";
        return;
    }

    fetch(API_BASE_URL + "/api/auth/token-login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(res => {
        if (!res.ok) throw new Error("Invalid login");
        return res.json();
    })
    .then(data => {
        localStorage.setItem("access_token", data.access);
        window.location.href = "../home/index.html";
    })
    .catch(err => {
        result.innerText = "Login failed";
        console.error(err);
    });
}


function checkMe() {
    const token = localStorage.getItem("access_token");
    fetch("http://127.0.0.1:8000/api/auth/me/", {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("result").innerText =
            JSON.stringify(data, null, 2);
    });
}
