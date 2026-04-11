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
            await fetch(`${API_BASE}/auth/signOut`, { method: "POST", credentials: "include" });
            window.location.href = "/login.html";
        });
    } else {
        document.getElementById("nav-account").style.display = "none";
        document.getElementById("nav-signout").style.display = "none";
    }
}

loadHeader();
