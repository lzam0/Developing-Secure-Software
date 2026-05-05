// Stores the numeric post ID and full slug after the post is fetched.
// postId is used for the PUT request; postSlug is used for the redirect after saving.
let postId = null;
let postSlug = null;

async function loadPostForEdit() {
    // Read the slug query parameter from the URL (e.g. ?slug=a3f9b2-my-post-title)
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");

    if (!slug) {
        window.location.href = "/blogListingPage.html";
        return;
    }

    // Extract the hex identifier — the first segment before the first hyphen.
    // The backend uses this to look up the post; the title portion is cosmetic.
    const hex = slug.split('-')[0];

    // Validate the hex is exactly 6 lowercase hex characters before sending to backend
    if (!/^[a-f0-9]{6}$/.test(hex)) {
        window.location.href = "/blogListingPage.html";
        return;
    }

    // Fetch the post and current user identity in parallel to avoid waterfall requests.
    // The post fetch uses the hex prefix; credentials: "include" sends the JWT cookie.
    const [response, user] = await Promise.all([
        fetch(`${BACKEND_URL}/posts/slug/${hex}`, { credentials: "include" }),
        getUser()
    ]);

    if (!response.ok) {
        window.location.href = "/blogListingPage.html";
        return;
    }

    const data = await response.json();
    const post = data.data.post;

    // Client-side authorship guard — redirect non-authors away from the edit form.
    // The server also enforces this on the PUT request (returns 403 if not the author).
    if (!user || user.id !== post.userid) {
        window.location.href = "/blogListingPage.html";
        return;
    }

    // Store for use in savePost()
    postId = post.id;
    postSlug = post.slug;

    // Pre-populate form fields using .value — never innerHTML — to prevent XSS
    document.getElementById("post-title").value = post.title;
    document.getElementById("post-body").value = post.content;

    // Match the stored tag against the select options and set it as selected
    const tags = Array.isArray(post.tags) ? post.tags : [post.tags];
    const select = document.getElementById("category");
    for (const option of select.options) {
        if (option.value === tags[0]) {
            option.selected = true;
            break;
        }
    }
}

async function savePost() {
    // Guard against savePost being called before the post has loaded
    if (!postId) return;

    const title = document.getElementById("post-title").value.trim();
    const tags = document.getElementById("category").value;
    const content = document.getElementById("post-body").value.trim();

    // Send the updated fields to the backend via PUT.
    // The server validates ownership (403 if not author) and field format via validatePost middleware.
    const response = await fetch(`${BACKEND_URL}/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, tags, content })
    });

    if (response.ok) {
        // Redirect back to the post page using the original slug — slug never changes on edit
        window.location.href = `/blogPage.html?slug=${encodeURIComponent(postSlug)}`;
    } else {
        const data = await response.json().catch(() => ({}));
        alert(data.message || "Failed to save changes.");
    }
}

document.getElementById("save-post-button").addEventListener("click", savePost);

loadPostForEdit();
