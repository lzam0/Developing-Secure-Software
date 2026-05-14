// Client-side JavaScript for loading the header component and managing authentication state in the navigation bar
function getCSRFToken() {
    return document.cookie.split(';')
        .find(row => row.trim().startsWith('csrfToken='))
        ?.trim().split("=")[1];
}

// Verify if the user is authenticated by checking for a valid JWT cookie with the backend
async function loadHeader() {
    // Fetch the header HTML fragment and insert it into the page
    const response = await fetch("/components/header.html");
    const data = await response.text();
    document.getElementById("header").innerHTML = data;

    // Call verifyAuth to check if the user is logged in and update the nav links accordingly
    const isAuth = await verifyAuth();

    // If authenticated, show account and sign-out links; otherwise, show sign-in and sign-up links
    if (isAuth) {
        document.getElementById("nav-signup").style.display = "none";
        document.getElementById("nav-signin").style.display = "none";
        document.getElementById("nav-account").style.display = "";
        document.getElementById("nav-signout").style.display = "";

        // Add event listener for sign-out link to call the backend API and clear the JWT cookie
        document.getElementById("nav-signout").addEventListener("click", async (e) => {
            e.preventDefault();
            await fetch(`${BACKEND_URL}/auth/signOut`, { method: "POST", credentials: "include", headers: { "X-CSRF-Token": getCSRFToken() } });
            window.location.href = "/login.html";
        });
    } else {
        // Not authenticated - hide account and sign-out links
        document.getElementById("nav-account").style.display = "none";
        document.getElementById("nav-signout").style.display = "none";
    }
}

loadHeader();
