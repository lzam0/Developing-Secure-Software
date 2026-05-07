/*
// Helper function for getting CSRF token out of cookie
*/

// function getCSRFToken() {
//     return document.cookie.split(';').find(row => row.startsWith('csrfToken='))
//     ?.split("=")[1];
// }


function getCSRFToken() {
    return document.cookie.split(';')
        .find(row => row.trim().startsWith('csrfToken='))
        ?.trim().split("=")[1];
}
