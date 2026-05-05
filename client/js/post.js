function handleThumb(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        event.target.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const uploadZone = document.getElementById("uploadZone");
        uploadZone.style.backgroundImage = `url('${e.target.result}')`;
        uploadZone.style.backgroundSize = "cover";
        uploadZone.style.backgroundPosition = "center";
        uploadZone.querySelector("p")?.remove();
        uploadZone.querySelector("span")?.remove();
    };
    reader.readAsDataURL(file);
}

async function publishPost() {
    const title = document.getElementById("post-title").value.trim();
    const tags = document.getElementById("category").value;
    const content = document.getElementById("post-body").value.trim();

    if (!title || !tags || !content) {
        alert("Please fill in all required fields (title, category, and content).");
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/posts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": getCSRFToken()
            },
            credentials: "include",
            body: JSON.stringify({ title, tags, content })
        });

        if (response.ok) {
            window.location.href = "/blogListingPage.html";
        } else {
            const errorData = await response.json();
            alert(`Failed to publish post: ${errorData.message}`);
        }
    } catch (error) {
        console.error("Error publishing post:", error?.message || String(error));
        alert("An error occurred while publishing. Please try again.");
    }
}

document.getElementById("thumbInput")?.addEventListener("change", handleThumb);
document.getElementById("publish-post-button")?.addEventListener("click", publishPost);
