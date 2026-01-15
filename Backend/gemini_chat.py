import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure the Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Error: GEMINI_API_KEY not found in environment variables.")
    exit(1)

genai.configure(api_key=api_key)

# Initialize the model

system_prompt = """
You are an expert Energy Consumption Analyst and Home Automation Consultant.
Your role is to assist users with analyzing energy usage, suggesting optimizations, and forecasting consumption based on inputs.

STRICT RESTRICTIONS:
1. You MUST ONLY discuss topics related to Energy Consumption, Power Usage, Home Automation, HVAC systems, and related technologies.
2. If a user asks about anything else (e.g., general knowledge, coding, entertainment, politics), you must politely REFUSE to answer and steer the conversation back to energy.
   Example Refusal: "I specialize only in energy consumption analysis. Please ask me about your power usage or home automation systems."

FORECASTING FEATURE:
If a user asks to "forecast" or "predict" energy consumption:
1. Ask them for the following details if not provided:
   - Current Temperature (in Celsius)
   - HVAC Usage (On/Off)
   - Lighting Usage (On/Off)
   - Square Footage (approximate)
2. Once you have these inputs, acting as an expert, provide a LOGICAL ESTIMATION of energy consumption (in kWh) for the next 24 hours.
   - Explain your reasoning (e.g., "High temperature increases HVAC load...").
   - Disclaimer: Clearly state "This is an AI-generated estimation based on general patterns, not a precise calculation."
"""

model = genai.GenerativeModel('gemini-2.0-flash', system_instruction=system_prompt)


def start_chat():
    print("--------------------------------------------------")
    print("       Gemini AI Chat (Type 'quit' to exit)")
    print("--------------------------------------------------")
    
    chat = model.start_chat(history=[])

    while True:
        user_input = input("\nYou: ")
        if user_input.lower() in ['quit', 'exit', 'bye']:
            print("Gemini: Goodbye!")
            break
        
        if not user_input.strip():
            continue

        try:
            response = chat.send_message(user_input, stream=True)
            print("Gemini: ", end="")
            for chunk in response:
                print(chunk.text, end="")
            print()
        except Exception as e:
            print(f"\nError: {e}")

if __name__ == "__main__":
    start_chat()
