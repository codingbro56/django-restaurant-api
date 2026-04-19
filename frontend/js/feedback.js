document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("feedbackForm");

    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            const btn = document.getElementById("feedbackSubmitBtn");
            btn.disabled = true;
            btn.innerText = "Submitting...";

            const payload = {
                name: document.getElementById("feedbackName").value,
                email: document.getElementById("feedbackEmail").value,
                rating: parseInt(document.getElementById("feedbackRating").value, 10),
                message: document.getElementById("feedbackMessage").value
            };

            try {
                const response = await fetch(API_BASE_URL + "/api/communication/feedback/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    showToast("Feedback submitted. Thank you!", "success");
                    form.reset();
                } else {
                    showToast("Failed to submit feedback.", "error");
                }
            } catch (error) {
                showToast("An error occurred.", "error");
            } finally {
                btn.disabled = false;
                btn.innerText = "Submit Feedback";
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
