document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contactForm");

    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            const btn = document.getElementById("contactSubmitBtn");
            btn.disabled = true;
            btn.innerText = "Sending...";

            const payload = {
                name: document.getElementById("contactName").value,
                email: document.getElementById("contactEmail").value,
                message: document.getElementById("contactMessage").value
            };

            try {
                const response = await fetch(API_BASE_URL + "/api/communication/contact/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    showToast("Message sent successfully!", "success");
                    form.reset();
                } else {
                    showToast("Failed to send message.", "error");
                }
            } catch (error) {
                showToast("An error occurred.", "error");
            } finally {
                btn.disabled = false;
                btn.innerText = "Send Message";
            }
        });
    }
});

function showToast(message, type = "success") {
    const toast = document.getElementById("ui-toast");
    if (!toast) return;

    toast.innerText = message;
    toast.className = `ui-toast show ${type}`;

    setTimeout(() => {
        toast.className = "ui-toast";
    }, 3000);
}
