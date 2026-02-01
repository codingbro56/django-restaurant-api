const token = localStorage.getItem("access_token");

if (!token) {
  window.location.href = "../auth/login.html";
}

fetch(API_BASE_URL + "/api/auth/me/", {
  headers: {
    Authorization: "Bearer " + token
  }
})
.then(res => res.json())
.then(user => {
  document.getElementById("username").innerText = user.username;
  document.getElementById("email").innerText = user.email;
  document.getElementById("role").innerText =
    user.is_staff ? "Admin" : "User";
});
