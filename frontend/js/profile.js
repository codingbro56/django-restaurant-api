const token = localStorage.getItem("access_token");
if (!token) window.location.href = "../auth/login.html";

const headers = {
  "Content-Type": "application/json",
  "Authorization": "Bearer " + token
};

const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `ui-toast ${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 50);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function loadProfile() {
  fetch(API_BASE_URL + "/api/auth/profile/", { headers })
    .then(res => {
      if (!res.ok) throw new Error("Failed to load profile");
      return res.json();
    })
    .then(data => {

      document.getElementById("profileName").textContent = data.full_name || data.username;
      document.getElementById("profileEmail").textContent = data.email;

      document.getElementById("full_name").value = data.full_name || "";
      document.getElementById("phone_no").value = data.phone_no || "";
      document.getElementById("address").value = data.address || "";
      document.getElementById("city").value = data.city || "";
      document.getElementById("state").value = data.state || "";
      document.getElementById("pincode").value = data.pincode || "";

      const initials = (data.full_name || data.username)
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase();

      document.getElementById("profileAvatar").textContent = initials;
    })
    .catch(() => showToast("Unable to load profile", "error"));
}

function enableEdit() {
  document.querySelectorAll(".form-group input")
    .forEach(input => input.disabled = false);

  editBtn.style.display = "none";
  saveBtn.style.display = "inline-block";
}

function updateProfile() {
  saveBtn.disabled = true;

  fetch(API_BASE_URL + "/api/auth/profile/", {
    method: "PUT",
    headers,
    body: JSON.stringify({
      full_name: full_name.value.trim(),
      phone_no: phone_no.value.trim(),
      address: address.value.trim(),
      city: city.value.trim(),
      state: state.value.trim(),
      pincode: pincode.value.trim()
    })
  })
  .then(res => {
    if (!res.ok) throw new Error("Update failed");
    return res.json();
  })
  .then(() => {
    showToast("Profile updated successfully");
    document.querySelectorAll(".form-group input")
      .forEach(input => input.disabled = true);

    editBtn.style.display = "inline-block";
    saveBtn.style.display = "none";
  })
  .catch(() => showToast("Failed to update profile", "error"))
  .finally(() => saveBtn.disabled = false);
}

editBtn.addEventListener("click", enableEdit);
saveBtn.addEventListener("click", updateProfile);

document.addEventListener("DOMContentLoaded", loadProfile);
