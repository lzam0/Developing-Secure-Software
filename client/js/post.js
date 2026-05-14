// Client-side JavaScript for creating and publishing blog posts
// This file is included in newPost.html and editPost.html, which share the same form structure for creating and editing posts.
// The backend endpoint for both creating and editing posts is /posts, with POST for creation and PUT for editing.

// Global variables to store post data for editing
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

// Publish a new post by sending a POST request to the backend with the form data
async function publishPost() {
    // Get title, tags, and content from the form fields
    // Trim whitespace and validate that required fields are not empty
    const title = document.getElementById("post-title").value.trim();
    const tags = document.getElementById("category").value;
    const content = document.getElementById("post-body").value.trim();

    // If any required field is empty, show an alert and prevent submission
    if (!title || !tags || !content) {
        alert("Please fill in all required fields (title, category, and content).");
        return;
    }

    // Form data to be sent in the request body as a json object
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

// Load post data for editing by sending a GET request to the backend with the post hex from the query string
document.getElementById("thumbInput")?.addEventListener("change", handleThumb);
document.getElementById("publish-post-button")?.addEventListener("click", publishPost);
