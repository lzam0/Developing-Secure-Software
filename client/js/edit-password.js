

async function changePassword() {
    const currentPassword = document.getElementById('current_password_input').value;
    const newPassword = document.getElementById('new_password_input').value;
    const confirmPassword = document.getElementById('confirm_password_input').value;

    // Client-side validation for new password and confirmation match
    if (newPassword !== confirmPassword) {
        alert("New password and confirmation do not match.");
        return;
    }

    // call the backend to change the password, which will also handle server-side validation and token revocation
    try {
        const response = await fetch(`${BACKEND_URL}/auth/password`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCSRFToken() },
            credentials: 'include',
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();

        // If the response is not ok, show the error message returned by the server or a generic message
        if (!response.ok) {
            alert(data.message || 'Failed to change password.');
            return;
        }

        // Server cleared the session — redirect to login
        window.location.href = '/login.html';
    } catch (err) {
        // Error Message
        console.error('Error changing password:', err);
        alert("An error occurred. Please try again.");
        return;
    }

};