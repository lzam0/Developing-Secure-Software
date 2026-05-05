// Returns the first two characters of a username as uppercase initials for the avatar
function initials(username) {
    return username.slice(0, 2).toUpperCase();
}

// Formats an ISO date string to a human-readable "Month Year" label
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

// Escapes HTML special characters to prevent XSS when injecting content into innerHTML
function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Displays an error message in the dedicated error element and unhides it
function showError(message) {
    const element = document.getElementById("post-error");
    element.textContent = message;
    element.style.display = "";
}

async function loadPost() {
    // Read the slug query parameter from the URL (e.g. ?slug=a3f9b2-my-post-title)
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");

    if (!slug) {
        showError("No post found.");
        return;
    }

    // The first segment before the first hyphen is the hex identifier used for the DB lookup.
    // The rest of the slug is cosmetic (title) and is ignored by the backend.
    const hex = slug.split('-')[0];

    // Validate the hex is exactly 6 lowercase hex characters before sending to backend
    if (!/^[a-f0-9]{6}$/.test(hex)) {
        showError("Post not found.");
        return;
    }

    try {
        // Fetch the post and the current user's identity in parallel to avoid waterfall requests.
        // credentials: "include" sends the JWT cookie so the backend can determine access level.
        const [response, user] = await Promise.all([
            fetch(`${BACKEND_URL}/posts/slug/${hex}`, { credentials: "include" }),
            getUser()
        ]);

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

        // "full" means the user is the author or a subscriber — they see all content.
        // "teaser" means unauthenticated or non-subscriber — only the first paragraph was returned.
        const access = data.data.access;

        // Use the first tag as the primary display tag in the header badge
        const tag = Array.isArray(post.tags) ? post.tags[0] : post.tags;

        // Populate post metadata fields using textContent (safe — no HTML parsing)
        document.getElementById("post-tag").textContent = tag;
        document.getElementById("post-title").textContent = post.title;
        document.getElementById("author-avatar").textContent = initials(post.username);
        document.getElementById("author-name").textContent = `By ${post.username}`;
        document.getElementById("post-date").textContent = formatDate(post.created_at);

        // Split content into paragraphs, escape each one, and wrap in <p> tags.
        // escapeHtml is required here because we're using innerHTML.
        const bodyElement = document.getElementById("post-body");
        bodyElement.innerHTML = post.content
            .split(/\n+/)
            .filter((paragraph) => paragraph.trim())
            .map((paragraph) => `<p>${escapeHtml(paragraph.trim())}</p>`)
            .join("");

        // If the backend returned a teaser, show the paywall prompt
        if (access === "teaser") {
            document.getElementById("paywall-cta").style.display = "";
        }

        // Render all tags in the footer tag row, escaping each before injecting into innerHTML
        const tagRow = document.getElementById("post-tag-row");
        const tags = Array.isArray(post.tags) ? post.tags : [post.tags];
        tagRow.innerHTML = tags.map((item, index) =>
            `<span class="post-tag${index > 0 ? ' tag-secondary' : ''}">${escapeHtml(item)}</span>`
        ).join("");

        // Only show the Edit button if the logged-in user == post's author.
        // This is a UX guard only — the server enforces ownership on the PUT request.
        if (user && user.id === post.userid) {
            const editBtn = document.getElementById("edit-button");
            editBtn.href = `/editBlog.html?slug=${encodeURIComponent(post.slug)}`;
            editBtn.style.display = "";
        }

        // Unhide the post content now that all fields are populated
        document.getElementById("post-wrapper").style.display = "";
    } catch (error) {
        console.error("Error loading post:", error);
        showError("An error occurred while loading the post.");
    }
}

loadPost();
