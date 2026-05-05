// Verify the user is authenticated
// If not, redirect to the login page
// Requires verify.js to be loaded first

(async () => {
    const isAuth = await verifyAuth();
    if (!isAuth) {
        window.location.href = "/login.html";
    }
})();
