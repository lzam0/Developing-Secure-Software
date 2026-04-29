function initials(username) {
    return username.slice(0, 2).toUpperCase();
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function showError(message) {
    const element = document.getElementById("post-error");
    element.textContent = message;
    element.style.display = "";
}

async function loadPost() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        showError("No post ID provided.");
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/posts/${id}`, { credentials: "include" });

        if (response.status === 404) {
            showError("Post not found.");
            return;
        }

        if (!response.ok) {
            showError("Failed to load post.");
            return;
        }

        const data = await response.json();
        const post = data.data.post;
        const tag = Array.isArray(post.tags) ? post.tags[0] : post.tags;

        document.getElementById("post-tag").textContent = tag;
        document.getElementById("post-title").textContent = post.title;
        document.getElementById("author-avatar").textContent = initials(post.username);
        document.getElementById("author-name").textContent = `By ${post.username}`;
        document.getElementById("post-date").textContent = formatDate(post.created_at);

        const bodyElement = document.getElementById("post-body");
        bodyElement.innerHTML = post.content
            .split(/\n+/)
            .filter((paragraph) => paragraph.trim())
            .map((paragraph) => `<p>${escapeHtml(paragraph.trim())}</p>`)
            .join("");

        const tagRow = document.getElementById("post-tag-row");
        const tags = Array.isArray(post.tags) ? post.tags : [post.tags];
        tagRow.innerHTML = tags.map((item, index) =>
            `<span class="post-tag${index > 0 ? ' tag-secondary' : ''}">${escapeHtml(item)}</span>`
        ).join("");

        document.getElementById("post-wrapper").style.display = "";
    } catch (error) {
        console.error("Error loading post:", error);
        showError("An error occurred while loading the post.");
    }
}

loadPost();
