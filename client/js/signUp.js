
// Create an event listener for the sign-up form submission
document.getElementById("signup_form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username_input").value.trim();
    const email = document.getElementById("email_input").value.trim();
    const confirmEmail = document.getElementById("confirm_email_input").value.trim();
    const password = document.getElementById("password_input").value;
    const confirmPassword = document.getElementById("confirm_password_input").value;

    const errorEl = document.getElementById("form_error");
    const showError = (msg) => {
        errorEl.textContent = msg;
        errorEl.style.display = "block";
    };
    errorEl.style.display = "none";

    // Client-side validation
    if (!username || !email || !confirmEmail || !password || !confirmPassword) {
        showError("All fields are required.");
        return;
    }
    if (email !== confirmEmail) {
        showError("Email addresses do not match.");
        return;
    }
    if (password !== confirmPassword) {
        showError("Passwords do not match.");
        return;
    }

    // Send a POST request to the backend API for registration
    try {
        const API_BASE = window.location.origin === "null" ? "http://localhost:5000" : "";
        const response = await fetch(`${API_BASE}/auth/signUp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            // Include cookies in the request
            credentials: "include",
            
            // Send the username, email, and password as JSON in the request body
            body: JSON.stringify({ username, email, password, confirmPassword })
        });

        if(response.ok) {
            // If registration is successful, redirect to the login page
            window.location.href = "login.html";
        }
        else {
            // If registration fails, show an error message
            const errorData = await response.json();
            showError(`Registration failed: ${errorData.message}`);
        }
    } catch (error) {
        // Error Message
        console.error("Error during registration:", error?.message || String(error));
        showError("An error occurred during registration. Please try again.");
    }
});
