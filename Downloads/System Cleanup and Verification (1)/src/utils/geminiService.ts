import { GEMINI_API_KEY, GEMINI_API_ENDPOINT } from '../config/gemini.config';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export class GeminiService {
  private apiKey: string;
  private endpoint: string;
  private useMock: boolean;

  constructor() {
    this.apiKey = GEMINI_API_KEY;
    this.endpoint = GEMINI_API_ENDPOINT;
    // Use mock responses if API key appears invalid or for testing
    this.useMock = !this.apiKey || this.apiKey.includes("YOUR_API_KEY") || this.apiKey.length < 20;
  }

  async sendMessage(message: string, conversationHistory: Message[] = []): Promise<string> {
    // Use mock responses for testing when API is not available
    if (this.useMock) {
      return this.getMockResponse(message);
    }

    try {
      // Build context from conversation history
      const context = this.buildContext(conversationHistory);
      
      // Create the prompt with ResQLink context
      const prompt = this.buildPrompt(message, context);

      const response = await fetch(`${this.endpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini API');
      }

      const assistantMessage = data.candidates[0].content.parts[0].text;
      return assistantMessage;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      // Fallback to mock response on API failure
      return this.getMockResponse(message);
    }
  }

  private buildContext(history: Message[]): string {
    if (history.length === 0) return '';
    
    return history
      .slice(-5) // Only use last 5 messages for context
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');
  }

  private buildPrompt(message: string, context: string): string {
    const systemContext = `You are ResQLink AI Assistant, a helpful and empathetic AI assistant for the ResQLink emergency response system. ResQLink is a smart emergency platform that connects patients, hospitals, and ambulances in real-time.

Your role is to:
1. Help users understand how to use ResQLink features
2. Provide guidance on emergency procedures and first aid (basic, non-diagnostic information only)
3. Answer questions about the platform's functionality
4. Offer emotional support during stressful situations
5. Remind users to call emergency services (911 or local emergency number) for life-threatening emergencies

Important guidelines:
- Always prioritize user safety
- Never provide medical diagnoses or treatment recommendations
- For serious emergencies, always recommend calling emergency services immediately
- Be empathetic, clear, and concise
- If unsure, recommend contacting medical professionals
- Provide information about ResQLink features when relevant

Platform features you can help with:
- Emergency request button and GPS tracking
- Hospital monitoring and ambulance assignment
- Real-time location tracking
- Emergency contact notifications
- In-app chat with emergency responders
- Medical profile management
- Payment processing

${context ? `Previous conversation:\n${context}\n` : ''}
User's current message: ${message}

Respond helpfully and empathetically:`;

    return systemContext;
  }

  private getMockResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('emergency') || lowerMessage.includes('help')) {
      return "For medical emergencies, please call 911 immediately or your local emergency number. While waiting for help, stay calm and provide your location. ResQLink can help connect you with emergency services - just tap the emergency button on your dashboard.";
    }
    
    if (lowerMessage.includes('feature') || lowerMessage.includes('what can')) {
      return "ResQLink offers real-time emergency response, GPS tracking, hospital coordination, ambulance dispatch, emergency contact notifications, and secure in-app communication with responders. You can also manage your medical profile and payment information.";
    }
    
    if (lowerMessage.includes('support') || lowerMessage.includes('help using')) {
      return "I'm here to help! You can ask me about ResQLink features, emergency procedures, or general support. For technical issues, check the settings page or contact our support team. For emergencies, always call 911 first.";
    }
    
    return "I'm your ResQLink AI Assistant. I can help you with emergency guidance, platform features, and support. For urgent medical situations, please call 911 immediately. How can I assist you today?";
  }

  async quickResponse(category: 'emergency' | 'feature' | 'support'): Promise<string> {
    const quickPrompts = {
      emergency: "What should I do in a medical emergency? Provide a brief overview of emergency procedures.",
      feature: "What are the main features of ResQLink? Give a brief summary.",
      support: "How can I get help using ResQLink? Provide basic support information."
    };

    return this.sendMessage(quickPrompts[category]);
  }
}

export const geminiService = new GeminiService();
