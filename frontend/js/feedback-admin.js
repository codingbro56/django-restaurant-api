let currentFeedbackId = null;

document.addEventListener("DOMContentLoaded", () => {
    loadFeedback();

    document.getElementById("sendReplyBtn").addEventListener("click", sendReply);
});

async function loadFeedback() {
    const container = document.getElementById("feedbackContainer");

    try {
        const res = await fetch(API_BASE_URL + "/api/admin/feedback/", {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("admin_token")
            }
        });

        if (!res.ok) throw new Error("Failed to load feedback");

        const data = await res.json();

        if (data.length === 0) {
            container.innerHTML = "<p>No feedback received yet.</p>";
            return;
        }

        container.innerHTML = "";

        data.forEach(item => {
            const date = new Date(item.created_at).toLocaleDateString();
            const isReviewed = item.is_reviewed;

            let replyHtml = "";
            if (item.admin_reply) {
                replyHtml = `
          <div class="admin-reply">
            <strong>Your Reply:</strong>
            ${item.admin_reply}
          </div>
        `;
            }

            let btnHtml = isReviewed
                ? `<button class="primary-btn" disabled style="opacity:0.5;">Responded</button>`
                : `<button class="primary-btn" onclick="openReplyModal(${item.id})">Reply</button>`;

            container.innerHTML += `
        <div class="feedback-card ${isReviewed ? 'resolved' : ''}">
          <span class="badge ${isReviewed ? 'reviewed' : 'pending'}">${isReviewed ? 'Reviewed' : 'Pending Reply'}</span>
          
          <div class="feedback-header">
            <h3>${item.name}</h3>
            <p>${item.email} • ${date}</p>
          </div>
          
          <div class="rating">
            ${'★'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)}
          </div>
          
          <div class="feedback-body">
            "${item.message}"
          </div>
          
          ${replyHtml}
          
          <div class="feedback-actions">
            ${btnHtml}
          </div>
        </div>
      `;
        });

    } catch (e) {
        container.innerHTML = `<p class="error">Error loading feedback: ${e.message}</p>`;
    }
}

function openReplyModal(id) {
    currentFeedbackId = id;
    document.getElementById("replyMessage").value = "";
    document.getElementById("replyModal").classList.add("show");
}

function closeReplyModal() {
    currentFeedbackId = null;
    document.getElementById("replyModal").classList.remove("show");
}

async function sendReply() {
    const message = document.getElementById("replyMessage").value.trim();
    if (!message) {
        showToast("Please enter a reply message.", "error");
        return;
    }

    const btn = document.getElementById("sendReplyBtn");
    btn.disabled = true;
    btn.innerText = "Sending...";

    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/feedback/${currentFeedbackId}/reply/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("admin_token")
            },
            body: JSON.stringify({ reply: message })
        });

        if (!res.ok) throw new Error("Failed to send reply");

        showToast("Reply sent successfully!", "success");
        closeReplyModal();
        loadFeedback(); // Reload grid
    } catch (e) {
        showToast(e.message, "error");
    } finally {
        btn.disabled = false;
        btn.innerText = "Send Reply";
    }
}

function showToast(message, type = "success") {
    const toast = document.getElementById("ui-toast");
    if (!toast) return;
    toast.innerText = message;
    toast.className = `ui-toast show ${type}`;
    setTimeout(() => { toast.className = "ui-toast"; }, 3000);
}
