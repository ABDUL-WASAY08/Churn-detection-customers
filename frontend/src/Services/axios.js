import axios from "axios";

export const Api = axios.create({
    // Use a build-time env var, fall back to the same-origin /api proxy
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
    headers: {
        'Content-Type': 'application/json',
    },
})