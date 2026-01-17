// Gemini API Configuration
// To set up your API key:
// 1. Go to https://makersuite.google.com/app/apikey
// 2. Create a new API key or copy an existing one
// 3. Set VITE_GEMINI_API_KEY in your .env file
// 4. Never commit API keys to version control
// 5. For production, use environment variables

export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyAu1sYNSaPFMx6vUyitBWQzAmtrr7rFj3Q";

// API endpoint - Updated to Gemini 1.5 Flash (faster and more available)
export const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
