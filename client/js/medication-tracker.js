const medicationModal = document.getElementById("myModal");
const medicationEntryForm = document.getElementById("entryForm");
const medicationTableBody = document.getElementById("tableBody");

function openMedicationModal() {
    medicationModal.style.display = "flex";
}

function closeMedicationModal() {
    medicationModal.style.display = "none";
    medicationEntryForm.reset();
}

function addMedicationRow(data) {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${data.date}</td>
        <td>${data.medication}</td>
        <td>${data.dosage}</td>
        <td>${data.frequency}</td>
        <td><small>${data.notes}</small></td>
        <td><button class="delete-btn" type="button">Delete</button></td>
    `;
    medicationTableBody.appendChild(row);
}

document.getElementById("open-modal-button").addEventListener("click", openMedicationModal);
document.getElementById("close-modal-button").addEventListener("click", closeMedicationModal);

window.addEventListener("click", (event) => {
    if (event.target === medicationModal) {
        closeMedicationModal();
    }
});

medicationEntryForm.addEventListener("submit", (event) => {
    event.preventDefault();

    addMedicationRow({
        date: document.getElementById("date").value,
        medication: document.getElementById("medication").value,
        dosage: document.getElementById("dosage").value,
        frequency: document.getElementById("frequency").value,
        notes: document.getElementById("notes").value
    });

    closeMedicationModal();
});

medicationTableBody.addEventListener("click", (event) => {
    if (!event.target.classList.contains("delete-btn")) {
        return;
    }

    if (confirm("Are you sure you want to remove this entry?")) {
        const row = event.target.closest("tr");
        row.style.opacity = "0";
        setTimeout(() => row.remove(), 300);
    }
});
