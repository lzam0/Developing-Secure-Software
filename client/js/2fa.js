document.getElementById("mfa_form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const otp = document.getElementById("mfa_code_input").value.trim();

    try {
        const response = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ otp })
        });

        const data = await response.json();

        if (response.ok) {
            //Use backend-provided redirect
            if (data.redirectTo) {
                window.location.href = data.redirectTo;
            } else {
                window.location.href = "login.html"; // fallback
            }
        } else {
            alert(`Verification failed: ${data.message}`);
        }

    } catch (error) {
        console.error("Error during OTP verification:", error);
        alert("An error occurred during OTP verification. Please try again.");
    }
});