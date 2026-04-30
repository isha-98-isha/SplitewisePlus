// Use VITE_API_URL env variable for production (set in Render dashboard)
// Falls back to localhost Spring Boot for local dev
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";