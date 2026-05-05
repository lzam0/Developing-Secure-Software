/*
// Helper function for getting CSRF token out of cookie
*/

function getCSRFToken() {
    return document.cookie.split(';').find(row => row.startsWith('csrfToken='))
    ?.split("=")[1];
}
