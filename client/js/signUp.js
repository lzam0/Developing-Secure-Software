document.getElementById("signup_form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const messageDisplay = document.getElementById("message_display");
    const username = document.getElementById("username_input").value;
    const email = document.getElementById("email_input").value;
    const confirmEmail = document.getElementById("confirm_email_input").value;
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

    grecaptcha.ready(function() {
        grecaptcha.execute('6LfmwbYsAAAAAKiIOTDeYfYPj3ISopFJpnfdYNDb', {action: 'signup'}).then(async (token) => {
            try {
                // Send a POST request to the backend API for registration
                        
               
                const response = await fetch(`${BACKEND_URL}/auth/signUp`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": getCSRFToken()
                    },
                    credentials: "include",
                    body: JSON.stringify({ 
                        username, 
                        email, 
                        password, 
                        confirmPassword, 
                        captchaToken: token 
                    })
                });
                
                const data = await response.json();
                
                if(response.ok) {
                // If registration is successful, redirect to the 2fa page for account verification
            
                    // show the generic success message
                    messageDisplay.textContent = data.message; 
                    messageDisplay.style.display = "block";
                    messageDisplay.style.backgroundColor = "#d4edda";
                    // clear the form so they don't submit twice
                    document.getElementById("signup_form").reset();

                    setTimeout(() => {
                        window.location.href = "2fa.html";
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
    });
});