function getCSRFToken() {
    return document.cookie.split(';')
        .find(row => row.trim().startsWith('csrfToken='))
        ?.trim().split("=")[1];
}

async function loadHeader() {
    const response = await fetch("/components/header.html");
    const data = await response.text();
    document.getElementById("header").innerHTML = data;

    const isAuth = await verifyAuth();

    if (isAuth) {
        document.getElementById("nav-signup").style.display = "none";
        document.getElementById("nav-signin").style.display = "none";
        document.getElementById("nav-account").style.display = "";
        document.getElementById("nav-signout").style.display = "";

        document.getElementById("nav-signout").addEventListener("click", async (e) => {
            e.preventDefault();
            await fetch(`${BACKEND_URL}/auth/signOut`, { method: "POST", credentials: "include", headers: { "X-CSRF-Token": getCSRFToken() } });
            window.location.href = "/login.html";
        });
    } else {
        document.getElementById("nav-account").style.display = "none";
        document.getElementById("nav-signout").style.display = "none";
    }
}

loadHeader();
