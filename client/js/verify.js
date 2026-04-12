// Reusable auth verification utility
// Must be loaded before auth-guard.js and header.js

const BACKEND_URL = "http://localhost:8000";


async function verifyAuth() {
    // try to verify the auth by sending a request to the backend
    try {
        // API call to auth/verify route
        const res = await fetch(`${BACKEND_URL}/auth/verify`, { credentials: "include" });
        return res.ok;
    } catch {
        // if the request fails, return false§
        return false;
    }
}