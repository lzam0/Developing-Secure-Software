document.addEventListener("DOMContentLoaded", async () => {
    // Fetch real profile data from the backend on page load
    // credentials: "include" sends the JWT cookie automatically
    try {
        const res = await fetch(`${BACKEND_URL}/auth/profile`, {
            credentials: "include"
        });
        if (res.ok) {
            const { data } = await res.json();

            const nameEl     = document.getElementById('full_name_input');
            const usernameEl = document.getElementById('username_input');
            const emailEl    = document.getElementById('email_input');

            // Use ?? '' so null values from DB render as empty string, not "null"
            if (nameEl)     nameEl.value     = data.name     ?? '';
            if (usernameEl) usernameEl.value = data.username ?? '';
            if (emailEl)    emailEl.value    = data.email    ?? '';
            // bio_input intentionally left blank — no bio column in the DB yet
        }
    } catch (err) {
        console.error('Failed to load profile:', err);
    }

    const editButton = document.getElementById('edit_profile_btn');
    const profileInputs = [
        document.getElementById('full_name_input'),
        document.getElementById('username_input'),
        document.getElementById('bio_input')
    ];

    editButton.addEventListener('click', async () => {
        const isReadOnly = profileInputs[0].hasAttribute('readonly');

        if (isReadOnly) {
            // Switch to edit mode
            profileInputs.forEach((input) => input.removeAttribute('readonly'));
            editButton.innerText = "Save Profile";
            editButton.style.backgroundColor = "#27ae60";
            return;
        }

        // Save to backend
        try {
            const res = await fetch(`${BACKEND_URL}/auth/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': getCSRFToken()
                },
                credentials: 'include',
                body: JSON.stringify({
                    username: document.getElementById('username_input').value,
                    name:     document.getElementById('full_name_input').value
                })
            });
            if (res.ok) {
                profileInputs.forEach((input) => input.setAttribute('readonly', true));
                editButton.innerText = "Edit Profile";
                editButton.style.backgroundColor = "#485b49";
                alert("Profile updated successfully!");
            } else {
                const err = await res.json();
                alert(`Failed to update profile: ${err.message}`);
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            alert("An error occurred. Please try again.");
        }
    });

    const emailInput = document.getElementById('email_input');
    document.getElementById('update_email_btn').addEventListener('click', async () => {
        if (emailInput.hasAttribute('readonly')) {
            // Switch to edit mode
            emailInput.removeAttribute('readonly');
            emailInput.focus();
            emailInput.style.borderColor = "#27ae60";
            return;
        }

        // Save email to backend
        try {
            const res = await fetch(`${BACKEND_URL}/auth/email`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': getCSRFToken()
                },
                credentials: 'include',
                body: JSON.stringify({ email: emailInput.value })
            });
            if (res.ok) {
                alert("Email updated successfully!");
                emailInput.setAttribute('readonly', true);
                emailInput.style.borderColor = "#ccc";
            } else {
                const err = await res.json();
                alert(`Failed to update email: ${err.message}`);
            }
        } catch (err) {
            console.error('Error updating email:', err);
            alert("An error occurred. Please try again.");
        }
    });

    document.getElementById('delete_account_btn').addEventListener('click', async () => {
        if (!confirm("Are you sure you want to permanently delete your account? This cannot be undone.")) {
            return;
        }
        // Delete account on the backend — cascades to all user data
        try {
            const res = await fetch(`${BACKEND_URL}/auth/account`, {
                method: 'DELETE',
                headers: { 'X-CSRF-Token': getCSRFToken() },
                credentials: 'include'
            });
            if (res.ok) {
                localStorage.clear();
                window.location.href = 'login.html';
            } else {
                const err = await res.json();
                alert(`Failed to delete account: ${err.message}`);
            }
        } catch (err) {
            console.error('Error deleting account:', err);
            alert("An error occurred. Please try again.");
        }
    });

    const passwordArea = document.getElementById('password_change_area');
    const changePasswordButton = document.getElementById('change_password_btn');
    const cancelPasswordButton = document.getElementById('cancel_password_btn');
    const savePasswordButton = document.getElementById('save_password_btn');

    changePasswordButton.addEventListener('click', () => {
        passwordArea.style.display = 'block';
        changePasswordButton.style.display = 'none';
        document.getElementById('password_input').value = '';
    });

    cancelPasswordButton.addEventListener('click', () => {
        passwordArea.style.display = 'none';
        changePasswordButton.style.display = 'block';
        document.querySelectorAll('#password_change_area input').forEach((input) => {
            input.value = '';
        });
    });

    savePasswordButton.addEventListener('click', () => {
        const current = document.getElementById('password_input').value;
        const next = document.getElementById('new_password_input').value;
        const confirm = document.getElementById('confirm_password_input').value;
        const actualSavedPassword = localStorage.getItem('password_input') || 'user123';

        if (current !== actualSavedPassword) {
            alert("Error 403: Current password incorrect.");
            return;
        }

        if (next !== confirm || next === "") {
            alert("New passwords must match and cannot be empty.");
            return;
        }

        console.log("Sending to Backend via JWT:", { newPass: next });
        localStorage.setItem('password_input', next);
        alert("Password updated successfully!");
        cancelPasswordButton.click();
    });
});
