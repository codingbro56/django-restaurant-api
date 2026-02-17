document.addEventListener("DOMContentLoaded", () => {
  initHomePage();
});

function initHomePage() {
  handleAuthUI();
  loadSpecialDish();
  setupSubscribe();
}

/* ==============================
   AUTH UI HANDLING
============================== */

function handleAuthUI() {
  const token = localStorage.getItem("access_token");

  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");

  if (token) {
    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
  } else {
    if (logoutBtn) logoutBtn.style.display = "none";
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("access_token");
      window.location.reload();
    });
  }
}

/* ==============================
   TOAST SYSTEM
============================== */

function showToast(message, type = "success") {
  const toast = document.getElementById("ui-toast");
  if (!toast) return;

  toast.textContent = message;
  toast.className = `ui-toast show ${type}`;

  setTimeout(() => {
    toast.className = "ui-toast";
  }, 2500);
}

/* ==============================
   LOAD SPECIAL DISH
============================== */

async function loadSpecialDish() {
  const box = document.getElementById("special-card");
  if (!box) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/menu/special/`);
    const special = await res.json();

    if (!special || Object.keys(special).length === 0) {
      box.innerHTML = `<p>No special dish available today.</p>`;
      return;
    }

    const imageUrl = special.image
      ? `${API_BASE_URL}${special.image}`
      : "../assets/images/special.png";

    box.classList.remove("loading");

    box.innerHTML = `
      <div class="special-image">
        <img src="${imageUrl}" alt="${special.name}" loading="lazy">
      </div>

      <div class="special-content">
        <h3>${special.name}</h3>
        <p>Chef’s special pick for today. Freshly prepared and highly recommended.</p>
        <div class="price">₹${special.price}</div>

        <button class="btn-primary" data-id="${special.id}" id="specialAddBtn">
          Add to Cart
        </button>
      </div>
    `;

    attachSpecialCartEvent();

  } catch (error) {
    box.innerHTML = `<p>Failed to load special dish.</p>`;
  }
}

/* ==============================
   ADD TO CART
============================== */

function attachSpecialCartEvent() {
  const btn = document.getElementById("specialAddBtn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      showToast("Please login to add items", "error");
      return;
    }

    const itemId = btn.dataset.id;

    btn.disabled = true;
    btn.textContent = "Adding...";

    try {
      const res = await fetch(`${API_BASE_URL}/api/cart/add/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          menu_item: itemId,
          quantity: 1
        })
      });

      if (!res.ok) throw new Error();

      showToast("Added to cart");

    } catch {
      showToast("Failed to add item", "error");
    }

    btn.disabled = false;
    btn.textContent = "Add to Cart";
  });
}

/* ==============================
   SUBSCRIBE SYSTEM
============================== */

function setupSubscribe() {
  const btn = document.getElementById("subscribeBtn");
  const input = document.getElementById("subscribeEmail");

  if (!btn || !input) return;

  btn.addEventListener("click", () => {
    const email = input.value.trim();

    if (!email) {
      showToast("Enter a valid email", "error");
      return;
    }

    showToast("Subscribed successfully!");
    input.value = "";
  });
}
