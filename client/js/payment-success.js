document.addEventListener("DOMContentLoaded", async () => {
    const statusLabel = document.getElementById("payment-status-label");
    const title = document.getElementById("payment-status-title");
    const message = document.getElementById("payment-status-message");
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
        statusLabel.textContent = "Confirmation needed";
        title.textContent = "Payment received";
        message.textContent = "Your payment returned successfully, but the checkout session could not be confirmed. Please refresh after a moment.";
        return;
    }

    try {
        const response = await fetch("/payments/confirm-subscription-checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": getCSRFToken()
            },
            credentials: "include",
            body: JSON.stringify({ sessionId })
        });

        const data = await response.json();

        if (!response.ok) {
            statusLabel.textContent = "Confirmation failed";
            title.textContent = "Payment successful";
            message.textContent = data.message || "Your payment succeeded, but your subscription could not be activated yet.";
            return;
        }

        statusLabel.textContent = "Subscription active";
        title.textContent = "Payment Successful";
        message.textContent = "Your subscription is now active. You can now read full blog posts.";
    } catch (error) {
        console.error("Subscription confirmation error:", error);
        statusLabel.textContent = "Confirmation failed";
        title.textContent = "Payment successful";
        message.textContent = "Your payment succeeded, but your subscription could not be activated yet.";
    }
});
