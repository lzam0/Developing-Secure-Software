document.addEventListener("DOMContentLoaded", () => {
    //Only attach the checkout handler on pages that include the subscribe button
    const subscribeButton = document.getElementById("subscribe-btn");

    if (!subscribeButton) return;

    subscribeButton.addEventListener("click", async () => {
        try {
            //Ask the backend to create a Stripe Checkout session for the subscription
            const response = await fetch("/payments/create-subscription-checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": getCSRFToken()
                },
                credentials: "include"
            });

            const data = await response.json();

            //Stop here if the backend could not create the checkout session
            if (!response.ok) {
                alert(data.message || "Could not start subscription.");
                return;
            }

            //Redirect the user to the hosted checkout page returned by the backend
            window.location.href = data.url;
        } catch (error) {
            console.error("Subscription error:", error);
            alert("Something went wrong starting the subscription.");
        }
    });
});
