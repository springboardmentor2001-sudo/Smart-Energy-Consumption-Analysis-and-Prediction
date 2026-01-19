import React, { useState, useRef, useEffect } from 'react';
import { chatbotService } from '../services/api';
import { Toast } from '../components/Toast';
import { MessageCircle, Send, Mic, Volume2, Lightbulb } from 'lucide-react';

export const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your Energy AI Assistant. 🔋\n\nI can give you energy predictions directly in chat! Just tell me:\n• Your HVAC details (e.g., '2 central ACs')\n• House size (e.g., '1500 sqft')\n• The month or season\n\nExample: 'I have 2 central ACs, 1500 sqft house, summer'\n\nOr ask me anything about energy consumption!",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [toast, setToast] = useState(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    'I have 2 central ACs, 1500 sqft house, summer',
    'Predict: 3 units, 2000 sqft, June',
    'How do I make an energy prediction?',
    'What factors affect energy consumption?',
  ]);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.onend = () => setIsListening(false);
    }
    
    // Load initial suggestions
    loadSuggestions();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSuggestions = async () => {
    try {
      const response = await chatbotService.getSuggestions?.();
      if (response?.data?.suggestions) {
        setSuggestedQuestions(response.data.suggestions.slice(0, 4));
      }
    } catch (error) {
      console.log('Suggestions endpoint not available, using defaults');
    }
  };

  const handleSendMessage = async (messageText = inputValue) => {
    if (!messageText.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await chatbotService.sendMessage(messageText);
      const botMessage = {
        id: messages.length + 2,
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date(),
        isPrediction: response.data.is_prediction,
      };
      setMessages(prev => [...prev, botMessage]);
      
      // Update suggested questions if provided
      if (response.data.suggested_questions) {
        setSuggestedQuestions(response.data.suggested_questions);
      }
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Failed to send message' });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleSuggestedQuestion = (question) => {
    handleSendMessage(question);
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      setToast({ type: 'error', message: 'Speech recognition not supported in your browser' });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);

      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputValue(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        setToast({ type: 'error', message: `Speech recognition error: ${event.error}` });
        setIsListening(false);
      };
    }
  };

  const handleSpeak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8 animate-fadeIn flex items-center gap-3">
        <MessageCircle size={40} className="text-blue-400" />
        Energy AI Assistant
      </h1>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Chat Area */}
        <div className="lg:col-span-3">
          <div className="card h-screen max-h-[600px] flex flex-col animate-slideIn">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-700 text-slate-100 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {message.sender === 'bot' && (
                    <button
                      onClick={() => handleSpeak(message.text)}
                      className="ml-2 p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      title="Read message aloud"
                    >
                      <Volume2 size={16} className="text-slate-400" />
                    </button>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 px-4 py-2 rounded-lg rounded-bl-none">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleFormSubmit} className="flex gap-2 mt-auto pt-4 border-t border-slate-700">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me about energy predictions..."
                className="input-field flex-1"
                disabled={loading}
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`p-2 rounded-lg transition-colors ${
                  isListening ? 'bg-red-600 text-white' : 'bg-slate-700 hover:bg-slate-600'
                }`}
                title="Voice input"
              >
                <Mic size={20} />
              </button>
              <button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>

        {/* Suggestions */}
        <div className="lg:col-span-1">
          <div className="card animate-slideIn">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Lightbulb size={18} className="text-yellow-400" />
              Quick Questions
            </h3>
            <div className="space-y-2">
              {suggestedQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="w-full text-left p-3 bg-slate-700/50 hover:bg-blue-600/30 hover:border-blue-500 border border-slate-600 rounded-lg transition-all text-sm text-slate-300 hover:text-white"
                >
                  {question}
                </button>
              ))}
            </div>

            <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-slate-300">
                <span className="font-semibold">💡 Tip:</span> Click any question above to ask it, or type your own. I only answer energy & prediction-related questions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
