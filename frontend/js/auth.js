// const API_BASE_URL = "http://127.0.0.1:8000";

// ---------- HELPER FUNCTIONS ----------
function showError(inputId, message) {
  const input = document.getElementById(inputId);
  if (!input) return;

  // Try to find error-text inside input-group first
  let error = input.closest(".input-group")?.querySelector(".error-text");

  // If not found, look for error-text sibling (for fields like phone outside input-group)
  if (!error) {
    error = input.parentElement?.querySelector(".error-text") ||
            input.nextElementSibling;
  }

  // Only set if error element exists
  if (error && error.classList?.contains("error-text")) {
    error.innerText = message;
    error.style.display = "block";
  }
}

function clearError(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  // Try to find error-text inside input-group first
  let error = input.closest(".input-group")?.querySelector(".error-text");

  // If not found, look for error-text sibling
  if (!error) {
    error = input.parentElement?.querySelector(".error-text") ||
            input.nextElementSibling;
  }

  // Only hide if error element exists
  if (error && error.classList?.contains("error-text")) {
    error.style.display = "none";
  }
}

// ---------- USERNAME SUGGESTION FEATURE ----------
function generateUsernameSuggestions(fullName) {
  const clean = fullName.trim().toLowerCase().replace(/\s+/g, " ");
  if (!clean) return [];

  const parts = clean.split(" ");
  const suggestions = [];

  if (parts.length === 1) {
    // Single name: "Rahul"
    suggestions.push(parts[0]);
    suggestions.push(parts[0] + "123");
  } else {
    // Multiple names: "Rahul Sharma"
    const first = parts[0];
    const last = parts[parts.length - 1];

    suggestions.push(first + last);                    // rahulsharma
    suggestions.push(first + "_" + last);              // rahul_sharma
    suggestions.push(first + last + "123");            // rahulsharma123
    suggestions.push(first + "." + last);              // rahul.sharma
  }

  return suggestions.slice(0, 4);
}

function showUsernameSuggestions(suggestions) {
  const container = document.getElementById("usernameSuggestions");
  if (!container) return;

  if (!suggestions || suggestions.length === 0) {
    container.classList.remove("active");
    return;
  }

  container.innerHTML = suggestions
    .map(
      sug => `<div class="suggestion-item" onclick="selectUsername('${sug}')">${sug}</div>`
    )
    .join("");
  container.classList.add("active");
}

function hideUsernameSuggestions() {
  const container = document.getElementById("usernameSuggestions");
  if (container) {
    container.classList.remove("active");
  }
}

function selectUsername(username) {
  const input = document.getElementById("username");
  if (input) {
    input.value = username;
    input.focus();
  }
  hideUsernameSuggestions();
}


function showFormError(message) {
  const box = document.getElementById("formError");
  if (box) {
    box.innerText = message;
    box.style.display = "block";
  }
}

function showFormSuccess(message) {
  const box = document.getElementById("formSuccess");
  if (box) {
    box.innerText = message;
    box.style.display = "block";
  }
}

// ---------- REGISTER FUNCTION ----------
function registerUser() {
  const formError = document.getElementById("formError");
  const formSuccess = document.getElementById("formSuccess");
  if (formError) formError.style.display = "none";
  if (formSuccess) formSuccess.style.display = "none";

  const fullName = document.getElementById("full_name").value.trim();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const city = document.getElementById("city").value.trim();
  const state = document.getElementById("state").value.trim();
  const pincode = document.getElementById("pincode").value.trim();
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirm_password").value;

  let valid = true;

  // Full Name
  if (!/^[A-Za-z ]+$/.test(fullName)) {
    showError("full_name", "Enter a valid full name");
    valid = false;
  } else clearError("full_name");

  // Username
  if (username.length < 4) {
    showError("username", "Username must be at least 4 characters");
    valid = false;
  } else clearError("username");

  // Email
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    showError("email", "Invalid email address");
    valid = false;
  } else clearError("email");

  // Phone
  if (!/^\d{10}$/.test(phone)) {
    showError("phone", "Phone must be 10 digits");
    valid = false;
  } else clearError("phone");

  // Address
  // City
  if (city && !/^[A-Za-z ]+$/.test(city)) {
    showError("city", "Enter a valid city");
    valid = false;
  } else clearError("city");

  // State
  if (state && !/^[A-Za-z ]+$/.test(state)) {
    showError("state", "Enter a valid state");
    valid = false;
  } else clearError("state");

  // Pincode
  if (pincode && !/^\d{6}$/.test(pincode)) {
    showError("pincode", "Pincode must be 6 digits");
    valid = false;
  } else clearError("pincode");


  // Password
  if (!/(?=.*\d)(?=.*[!@#$%^&*]).{8,}/.test(password)) {
    showError("password", "Weak password");
    valid = false;
  } else clearError("password");

  // Confirm password
  if (password !== confirm) {
    showError("confirm_password", "Passwords do not match");
    valid = false;
  } else clearError("confirm_password");

  if (!valid) {
    showFormError("Please fix the highlighted errors.");
    return;
  }

  // ---------- API ----------
  fetch(API_BASE_URL + "/api/auth/register/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      full_name: fullName,
      username,
      email,
      phone_no: phone,
      address,
      city,
      state,
      pincode,
      password,
      confirm_password: confirm
    })
  })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (!ok) {
        showToast(data.message || "Registration failed", "error");
        return;
      }

      showToast("Registration successful!", "success");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1200);

    })
}

function loginUser() {
  const usernameEl = document.getElementById("username");
  const passwordEl = document.getElementById("password");
  const formError = document.getElementById("formError");

  if (formError) formError.style.display = "none";

  const username = usernameEl ? usernameEl.value.trim() : "";
  const password = passwordEl ? passwordEl.value : "";

  if (!username || !password) {
    if (formError) {
      formError.innerText = "Please enter username and password";
      formError.style.display = "block";
    }
    return;
  }

  fetch(API_BASE_URL + "/api/auth/token-login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (!ok) {
        const msg = (data && (data.detail || data.message)) || "Invalid username or password";
        if (formError) {
          formError.innerText = msg;
          formError.style.display = "block";
        }
        return Promise.reject(new Error(msg));
      }

      if (!data || !data.access) {
        const msg = "Login response missing access token";
        if (formError) {
          formError.innerText = msg;
          formError.style.display = "block";
        }
        return Promise.reject(new Error(msg));
      }

      localStorage.setItem("access_token", data.access);

      return fetch(API_BASE_URL + "/api/auth/profile/", {
        headers: { "Authorization": "Bearer " + data.access }
      });
    })
    .then(profileRes => {
      if (!profileRes) return Promise.reject(new Error("No profile response"));
      return profileRes.json().then(profileData => ({ ok: profileRes.ok, profileData }));
    })
    .then(({ ok, profileData }) => {
      if (!ok) {
        const msg = (profileData && (profileData.detail || profileData.message)) || "Failed to fetch profile";
        if (formError) {
          formError.innerText = msg;
          formError.style.display = "block";
        }
        return Promise.reject(new Error(msg));
      }

      const userName = (profileData && (profileData.full_name || profileData.username)) || "User";
      const initials = (userName
        .split(" ")
        .map(n => n[0] || "")
        .join("")
        .replace(/[^A-Za-z]/g, "") || "U"
      ).slice(0, 3).toUpperCase();

      localStorage.setItem("user_name", userName);
      localStorage.setItem("user_initials", initials);
      localStorage.setItem("user_email", (profileData && profileData.email) || "");

      window.location.href = "../home/index.html";
    })
    .catch(err => {
      if (formError) {
        formError.innerText = err && err.message ? err.message : "Server error. Please try again later.";
        formError.style.display = "block";
      } else {
        console.error(err);
      }
    });
}

function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user_name");
  localStorage.removeItem("user_initials");
  localStorage.removeItem("user_email");

  window.location.href = "../home/index.html";
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


document.querySelectorAll(".toggle-password").forEach(icon => {
  icon.addEventListener("click", () => {
    const input = document.getElementById(icon.dataset.target);
    input.type = input.type === "password" ? "text" : "password";
  });
});
// ---------- USERNAME SUGGESTIONS EVENT LISTENER ----------
const fullNameInput = document.getElementById("full_name");
if (fullNameInput) {
  fullNameInput.addEventListener("blur", () => {
    const fullName = fullNameInput.value.trim();
    if (fullName && /^[A-Za-z ]+$/.test(fullName)) {
      const suggestions = generateUsernameSuggestions(fullName);
      showUsernameSuggestions(suggestions);
    } else {
      hideUsernameSuggestions();
    }
  });
}

// Hide suggestions when clicking username field
const usernameInput = document.getElementById("username");
if (usernameInput) {
  usernameInput.addEventListener("focus", () => {
    hideUsernameSuggestions();
  });
}

// 
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;

  container.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 50);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
