
// Create an event listener for the sign-up form submission
document.getElementById("signup_form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const messageDisplay = document.getElementById("message_display");
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

        const data = await response.json();

        if(response.ok) {
            // If registration is successful, redirect to the login page
            
            // show the generic success message
            messageDisplay.textContent = data.message; 
            messageDisplay.style.display = "block";
            messageDisplay.style.backgroundColor = "#d4edda";
            // clear the form so they don't submit twice
            document.getElementById("signup_form").reset();

            setTimeout(() => {
                window.location.href = "login.html";
            }, 4000);
        }
     else {
            // this only triggers for ACTUAL errors (like server down or invalid email format)
            messageDisplay.textContent = data.message || "An error occurred.";
            messageDisplay.style.display = "block";
            messageDisplay.style.backgroundColor = "#f8d7da"; // Red
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred during registration. Please try again.");
    }
});
