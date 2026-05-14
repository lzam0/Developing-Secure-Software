
// Helper function to get CSRF token from cookies for secure requests
function getCSRFToken() {
    return document.cookie.split(';')
        .find(row => row.trim().startsWith('csrfToken='))
        ?.trim().split("=")[1];
}
