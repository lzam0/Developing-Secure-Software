(async () => {
    const isAuth = await verifyAuth();
    if (isAuth) {
        window.location.href = "/blogListingPage.html";
    }
})();
