// Verify the user is authenticated
// If not, redirect to the login page

// Essentially a middleware function that checks if the user is authenticated
(async () => {

    // Get the API base URL
    const API_BASE = window.location.origin === "null" ? "http://localhost:5000" : "";
    // Try to verify the user is authenticated
    try {
        // Send a GET request to the backend API to verify the user is authenticated
        const res = await fetch(`${API_BASE}/auth/verify`, { credentials: "include" });
        
        // If the user is not authenticated, redirect to the login page
        if (!res.ok) {
            window.location.href = "/login.html";
        }
    } catch {
        // If the user is not authenticated, redirect to the login page
        window.location.href = "/login.html";
    }
})();
