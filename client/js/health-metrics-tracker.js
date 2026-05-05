const metricsModal = document.getElementById("myModal");
const metricsEntryForm = document.getElementById("entryForm");
const metricsTableBody = document.getElementById("tableBody");

function openMetricsModal() {
    metricsModal.style.display = "flex";
}

function closeMetricsModal() {
    metricsModal.style.display = "none";
    metricsEntryForm.reset();
}

function addMetricRow(data) {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${data.date}</td>
        <td><strong>${data.metric}</strong></td>
        <td>${data.current}</td>
        <td>${data.goal || '-'}</td>
        <td><small>${data.notes}</small></td>
        <td><button class="delete-btn" type="button">Delete</button></td>
    `;
    metricsTableBody.appendChild(row);
}

document.getElementById("open-modal-button").addEventListener("click", openMetricsModal);
document.getElementById("close-modal-button").addEventListener("click", closeMetricsModal);

window.addEventListener("click", (event) => {
    if (event.target === metricsModal) {
        closeMetricsModal();
    }
});

metricsEntryForm.addEventListener("submit", (event) => {
    event.preventDefault();

    addMetricRow({
        date: document.getElementById("date").value,
        metric: document.getElementById("metric").value,
        current: document.getElementById("current").value,
        goal: document.getElementById("goal").value,
        notes: document.getElementById("notes").value
    });

    closeMetricsModal();
});

metricsTableBody.addEventListener("click", (event) => {
    if (!event.target.classList.contains("delete-btn")) {
        return;
    }

    if (confirm("Remove this metric entry?")) {
        const row = event.target.closest("tr");
        row.style.opacity = "0";
        setTimeout(() => row.remove(), 300);
    }
});
