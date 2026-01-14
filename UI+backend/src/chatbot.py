import google.generativeai as genai
import os
import markdown

def load_chatbot(api_key):
    if not api_key:
        return None
    
    try:
        genai.configure(api_key=api_key)
        
        
        all_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        
        priority_order = [
            'models/gemini-1.5-flash',
            'models/gemini-1.5-flash-latest',
            'models/gemini-1.5-pro',
            'models/gemini-pro'
        ]
        
        selected_model_name = None

        for preferred in priority_order:
            if preferred in all_models:
                selected_model_name = preferred
                break
        
        
        if not selected_model_name and all_models:
            selected_model_name = all_models[0]
            
        if selected_model_name:
            print(f" Chatbot connected using: {selected_model_name}")
            return genai.GenerativeModel(selected_model_name)
        else:
            print(" No compatible models found.")
            return None

    except Exception as e:
        print(f"Error loading chatbot: {e}")
        return None



def get_chat_response(model, user_prompt):
    if model is None:
        return "AI assistant is currently unavailable."

    system_prompt = """
    You are 'Electro AI', a Smart Home Energy Assistant.
    
    CRITICAL GUIDELINES:
    1. **Be Concise:** Keep answers under 100 words whenever possible.
    2. **Format Cleanly:** Use bullet points for lists.
    3. **No Fluff:** Get straight to the point. Do not start with "Hello" or "As an AI".
    4. **Formatting:** Use Markdown (bolding, lists) to make text readable.
    
    If the user asks for a prediction without data, ask for: Temperature, Occupancy, and HVAC status.
    """

    try:
        full_prompt = f"{system_prompt}\n\nUser Query: {user_prompt}"
        
        response = model.generate_content(full_prompt)
        raw_text = response.text
        
        html_text = markdown.markdown(raw_text)
        
        if not response.parts:
            print("Response was blocked by safety filters.")
            return "I cannot answer that specific query due to safety guidelines. Please ask something else about energy."
            
        return html_text
        
    except Exception as e:
        print(f"Error generating chat response: {e}") # <--- THIS is what we need to read in the terminal
        return "I apologize, but I'm having trouble processing your request."