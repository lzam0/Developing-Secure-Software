let allPosts = [];

// Helper functions 
// Initials function to get the first two letters of the username for the avatar
function initials(username) {
    return username.slice(0, 2).toUpperCase();
}

// Format date function to display the post creation date in "Month Year" format
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

// Render cards function to display the posts in the grid
function renderCards(posts) {
    const grid = document.getElementById("card-grid");
    grid.innerHTML = "";

    if (posts.length === 0) {
        grid.innerHTML = '<p style="color:#6b4c3b;font-size:0.95rem;">No posts found.</p>';
        return;
    }

    // Post formatting
    posts.forEach((post) => {
        const tags = Array.isArray(post.tags) ? post.tags : [post.tags];
        const card = document.createElement("a");
        card.href = `/blogPage.html?slug=${post.slug}`;
        card.className = "card";
        card.innerHTML = `
            <div class="card-body">
                <div class="card-tag-row">${tags.map((t, i) => `<span class="card-tag${i > 0 ? ' card-tag-secondary' : ''}">${t}</span>`).join('')}</div>
                <h2 class="card-title">${post.title}</h2>
                <div class="card-meta">
                    <div class="card-avatar">${initials(post.username)}</div>
                    <span class="card-author">${post.username}</span>
                    <span class="card-dot">·</span>
                    <span class="card-date">${formatDate(post.created_at)}</span>
                </div>
            </div>`;
        grid.appendChild(card);
    });
}

// Fetch post async function
async function fetchPosts() {
    const grid = document.getElementById("card-grid");

    // Call Fetch API from /post api
    try {
        const response = await fetch(`${BACKEND_URL}/posts`, { credentials: "include" });
        if (!response.ok) {
            // Error response
            grid.innerHTML = '<p style="color:#6b4c3b;">Failed to load posts.</p>';
            return;
        }

        const data = await response.json();
        allPosts = data.data.posts;
        renderCards(allPosts); // Render the posts
    } catch (error) {
        // Error Message
        console.error("Error fetching posts:", error);
        grid.innerHTML = '<p style="color:#6b4c3b;">Failed to load posts.</p>';
    }
}

// Filter button
document.querySelectorAll(".filter-button").forEach((button) => {

    // Event listener
    button.addEventListener("click", () => {
        document.querySelectorAll(".filter-button").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");

        const label = button.textContent.trim();
        if (label === "All") {
            renderCards(allPosts);
            return;
        }

        renderCards(allPosts.filter((post) => {
            const tags = Array.isArray(post.tags) ? post.tags : [post.tags];
            return tags.includes(label);
        }));
    });
});

fetchPosts();
