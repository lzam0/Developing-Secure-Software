
// Create an event listener for the sign-up form submission
document.getElementById("signup_form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username_input").value;
    const email = document.getElementById("email_input").value;
    const password = document.getElementById("password_input").value;
    const confirmPassword = document.getElementById("confirm_password_input").value;


    // Basic client-side validation - DYLAN IMPLEMENT THIS

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
            body: JSON.stringify({ username, email, password })
        });

        if(response.ok) {
            // If registration is successful, redirect to the login page
            window.location.href = "login.html";
        }
        else {
            // If registration fails, show an error message
            const errorData = await response.json();
            alert(`Registration failed: ${errorData.message}`);
        }
    } catch (error) {
        // Error Message
        console.error("Error during registration:", error?.message || String(error));
        alert("An error occurred during registration. Please try again.");
        return;
    }
});
