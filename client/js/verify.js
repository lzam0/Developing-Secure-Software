// Reusable auth verification utility
// Must be loaded before auth-guard.js and header.js

// Base URL for backend API calls
const BACKEND_URL = window.location.origin;

// Returns true if the user has a valid JWT cookie, false otherwise.
// Used by auth-guard.js and header.js to check login state.
async function verifyAuth() {
    try {
        // The JWT cookie is sent automatically with credentials: "include"
        const res = await fetch(`${BACKEND_URL}/auth/verify`, { credentials: "include" });
        return res.ok;
    } catch {
        return false;
    }
}

// Returns the decoded user object (id, username) from the JWT if authenticated, or null.
// Used when the caller needs the user's identity, not just login state.
async function getUser() {
    try {
        const res = await fetch(`${BACKEND_URL}/auth/verify`, { credentials: "include" });
        if (!res.ok) return null;
        const data = await res.json();
        return data.user ?? null;
    } catch {
        return null;
    }
}
