document.addEventListener("DOMContentLoaded", () => {
    const subscribeButton = document.getElementById("subscribe-btn");

    if (!subscribeButton) return;

    subscribeButton.addEventListener("click", async () => {
        try {
            const response = await fetch("/payments/create-subscription-checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": getCSRFToken()
                },
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Could not start subscription.");
                return;
            }

            window.location.href = data.url;
        } catch (error) {
            console.error("Subscription error:", error);
            alert("Something went wrong starting the subscription.");
        }
    });
});