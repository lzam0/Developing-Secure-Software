document.addEventListener("DOMContentLoaded", () => {
    const fields = ['full_name_input', 'username_input', 'bio_input', 'email_input'];

    fields.forEach((id) => {
        const savedValue = localStorage.getItem(id);
        const element = document.getElementById(id);
        if (savedValue && element) {
            element.value = savedValue;
        }
    });

    const editButton = document.getElementById('edit_profile_btn');
    const profileInputs = [
        document.getElementById('full_name_input'),
        document.getElementById('username_input'),
        document.getElementById('bio_input')
    ];

    editButton.addEventListener('click', () => {
        const isReadOnly = profileInputs[0].hasAttribute('readonly');

        if (isReadOnly) {
            profileInputs.forEach((input) => input.removeAttribute('readonly'));
            editButton.innerText = "Save Profile";
            editButton.style.backgroundColor = "#27ae60";
            return;
        }

        profileInputs.forEach((input) => {
            input.setAttribute('readonly', true);
            localStorage.setItem(input.id, input.value);
        });
        editButton.innerText = "Edit Profile";
        editButton.style.backgroundColor = "#485b49";
        alert("Profile Saved locally!");
    });

    const emailInput = document.getElementById('email_input');
    document.getElementById('update_email_btn').addEventListener('click', () => {
        if (emailInput.hasAttribute('readonly')) {
            emailInput.removeAttribute('readonly');
            emailInput.focus();
            emailInput.style.borderColor = "#27ae60";
            return;
        }

        console.log("Sending to Backend via JWT:", { newEmail: emailInput.value });
        localStorage.setItem('email_input', emailInput.value);
        alert("Email updated successfully!");
        emailInput.setAttribute('readonly', true);
        emailInput.style.borderColor = "#ccc";
    });

    document.getElementById('delete_account_btn').addEventListener('click', () => {
        if (confirm("Clear all saved data?")) {
            localStorage.clear();
            location.reload();
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
