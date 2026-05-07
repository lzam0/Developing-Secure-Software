// Create an event listener for the sign in form submission
document.getElementById("login_form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Get the email and password values from the input fields
    const email = document.getElementById("email_input").value;
    const password = document.getElementById("password_input").value;

    grecaptcha.ready(function () {
        grecaptcha.execute('6LfmwbYsAAAAAKiIOTDeYfYPj3ISopFJpnfdYNDb', {action: 'login'}).then(async (token) => {
            // Send a POST request to the backend API for authentication
            try {
                const response = await fetch(`${BACKEND_URL}/auth/signIn`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": getCSRFToken()
                    },
                    // Include cookies in the request
                    credentials: "include",

                    // Send the email and password as JSON in the request body
                    body: JSON.stringify({ email, password, captchaToken: token })
                });

                if(response.ok) {
                    // If login is successful, redirect
                    window.location.href = "2fa.html";
                } else {
                    // If login fails, show an error message
                    const errorData = await response.json();
                    alert(`Login failed: ${errorData.message}`);
                }

            } catch (error) {
                // Error Message
                console.error("Error during login:", error?.message || String(error));
                alert("An error occurred during login. Please try again.");
                return;
            }
        });
    });
});

/* To ensure that users cannot use network phising tools to steal credentials, we can implement the following measures:
1. Implement randomised response times for login attempts to make it harder for attackers to identify valid credentials based on response times.
2. Use CAPTCHAs after a certain number of failed login attempts to prevent automated attacks.
3. Implement rate limiting on login attempts to prevent brute-force attacks.
4. Use secure cookies with the HttpOnly and Secure flags to prevent client-side scripts from accessing authentication tokens.
*/
