function apiRequest(endpoint, options = {}) {
    return fetch(API_BASE_URL + endpoint, {
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include", // IMPORTANT for session auth
        ...options
    }).then(res => res.json());
}
