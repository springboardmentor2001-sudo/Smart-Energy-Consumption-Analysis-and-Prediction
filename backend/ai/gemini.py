from google import genai
import os

# Initialize Gemini client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def ask_gemini(prompt: str) -> str:
    """
    Send a prompt to Gemini 2.5 and return text response
    """
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-lite-preview-02-05",
            contents=prompt
        )
        return response.text

    except Exception as e:
        print("❌ Gemini error:", e)
        return "Sorry, I am unable to respond right now."
