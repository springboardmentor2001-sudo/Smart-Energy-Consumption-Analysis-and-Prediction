from google import genai
import os

# Create client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

try:
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents="Say hello in one sentence"
    )

    print("✅ GEMINI RESPONSE:")
    print(response.text)

except Exception as e:
    print("❌ GEMINI ERROR:")
    print(e)
