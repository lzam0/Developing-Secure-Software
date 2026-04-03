document.getElementById("mfa_form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const otp = document.getElementById("mfa_code_input").value.trim();

    try {
        const API_BASE = window.location.origin === "null" ? "http://localhost:5050" : "";

        const response = await fetch(`${API_BASE}/auth/verify-otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ otp })
        });

        const data = await response.json();

        if (response.ok) {
            window.location.href = "blogListingPage.html";
        } else {
            alert(`Verification failed: ${data.message}`);
        }
    } catch (error) {
        console.error("Error during OTP verification:", error);
        alert("An error occurred during OTP verification. Please try again.");
    }
});