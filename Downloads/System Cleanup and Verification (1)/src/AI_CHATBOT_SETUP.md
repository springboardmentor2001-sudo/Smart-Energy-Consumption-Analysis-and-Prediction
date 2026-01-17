# 🤖 AI Chatbot Setup Guide - ResQLink

## Overview
ResQLink now includes an AI-powered chatbot assistant powered by Google's Gemini API. The chatbot provides emergency guidance, platform support, and helpful information to all users across the system.

## ✨ Features

### 1. **Intelligent Assistance**
- Emergency procedure guidance
- Platform feature explanations
- First aid information (non-diagnostic)
- Emotional support during stressful situations
- Real-time conversational AI

### 2. **Premium Design**
- Floating chat button with pulse animation
- Glassmorphism effects matching ResQLink aesthetic
- Smooth animations and transitions
- Pink-to-red gradient styling
- Responsive design

### 3. **Smart Context**
- Maintains conversation history
- Context-aware responses
- Quick action buttons for common queries
- Safety-first approach (always recommends 911 for emergencies)

### 4. **Safety Features**
- Content filtering enabled
- Medical disclaimer (no diagnoses)
- Emergency number reminders
- Appropriate safety thresholds

## 🔧 Setup Instructions

### Step 1: API Key Configuration

Your Gemini API key has been configured in `/config/gemini.config.ts`:

```typescript
export const GEMINI_API_KEY = "AIzaSyAu1sYNSaPFMx6vUyitBWQzAmtrr7rFj3Q";
```

⚠️ **Important Security Notes:**
- The API key is currently hardcoded for development
- For production, use environment variables
- Never commit API keys to public repositories
- Consider using a backend proxy for API calls in production

### Step 2: Environment Variables (Optional - Production)

For production deployment, use environment variables:

**For Windows (Command Prompt):**
```cmd
setx GEMINI_API_KEY "AIzaSyAu1sYNSaPFMx6vUyitBWQzAmtrr7rFj3Q"
```

**For Windows (PowerShell):**
```powershell
[System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'AIzaSyAu1sYNSaPFMx6vUyitBWQzAmtrr7rFj3Q', 'User')
```

**For Linux/Mac:**
```bash
export GEMINI_API_KEY="AIzaSyAu1sYNSaPFMx6vUyitBWQzAmtrr7rFj3Q"
```

Then update `/config/gemini.config.ts` to use environment variables:
```typescript
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "YOUR_FALLBACK_KEY";
```

## 📁 File Structure

```
/config/
  └── gemini.config.ts          # API configuration

/utils/
  └── geminiService.ts          # Gemini API service wrapper

/components/
  └── AIChatBot.tsx            # Main chatbot component

/App.tsx                        # Chatbot integrated here
```

## 🎯 Usage

### For Users

1. **Open Chatbot**: Click the floating pink sparkle button in the bottom-right corner
2. **Quick Actions**: Use quick action buttons for common queries
3. **Type Message**: Type your question and press Enter or click Send
4. **Get Help**: Ask about:
   - Emergency procedures
   - Platform features
   - How to use ResQLink
   - First aid information
   - Support and troubleshooting

### Quick Action Categories

- **Emergency Help** 🚨: Get guidance on medical emergencies
- **Features** ⚡: Learn about ResQLink platform features
- **Support** ❓: Get help using the platform

## 🔒 Safety & Privacy

### Built-in Safety Features

1. **Content Filtering**: All responses filtered for harmful content
2. **Medical Disclaimers**: No diagnostic information provided
3. **Emergency Priority**: Always recommends calling 911 for serious situations
4. **Conversation Limits**: Only last 5 messages used for context

### Safety Settings Enabled

- Harassment protection: BLOCK_MEDIUM_AND_ABOVE
- Hate speech protection: BLOCK_MEDIUM_AND_ABOVE
- Sexual content protection: BLOCK_MEDIUM_AND_ABOVE
- Dangerous content protection: BLOCK_MEDIUM_AND_ABOVE

## 🎨 Customization

### Styling

The chatbot uses Tailwind CSS and matches ResQLink's premium design:
- Pink-to-red gradients
- Glassmorphism effects
- Smooth animations with Framer Motion
- Responsive design

### Modifying AI Behavior

Edit the system context in `/utils/geminiService.ts`:

```typescript
private buildPrompt(message: string, context: string): string {
  const systemContext = `You are ResQLink AI Assistant...`;
  // Modify this to change AI personality and guidelines
}
```

### Adjusting Response Parameters

In `/utils/geminiService.ts`, modify:

```typescript
generationConfig: {
  temperature: 0.7,      // Creativity (0-1)
  topK: 40,              // Token sampling
  topP: 0.95,            // Nucleus sampling
  maxOutputTokens: 1024, // Response length
}
```

## 🧪 Testing

### Test Scenarios

1. **Emergency Query**: "What should I do if someone is having a heart attack?"
2. **Feature Query**: "How do I request an ambulance?"
3. **Support Query**: "I can't see my emergency history"
4. **Conversation Flow**: Ask follow-up questions

### Expected Behavior

- ✅ Responds within 2-3 seconds
- ✅ Provides helpful, empathetic responses
- ✅ Recommends 911 for emergencies
- ✅ Maintains conversation context
- ✅ Handles errors gracefully

## 🐛 Troubleshooting

### Issue: "Failed to get response"

**Possible Causes:**
1. Invalid API key
2. API quota exceeded
3. Network connectivity issues
4. API service down

**Solutions:**
1. Verify API key in `/config/gemini.config.ts`
2. Check [Google Cloud Console](https://console.cloud.google.com/) for quota
3. Check internet connection
4. Check [Gemini API status](https://status.cloud.google.com/)

### Issue: Chatbot button not appearing

**Solutions:**
1. Ensure you're logged in (chatbot only shows for authenticated users)
2. Check browser console for errors
3. Verify `/components/AIChatBot.tsx` is properly imported in App.tsx

### Issue: Slow responses

**Solutions:**
1. Check internet connection speed
2. Reduce maxOutputTokens in generation config
3. Clear conversation history (close and reopen chat)

## 📊 API Usage & Limits

### Gemini API Free Tier
- 60 requests per minute
- 1,500 requests per day
- Rate limits may apply

### Best Practices
- Monitor usage in Google Cloud Console
- Implement caching for common queries
- Consider upgrading to paid tier for production

## 🚀 Future Enhancements

### Potential Improvements
- [ ] Voice input/output
- [ ] Multi-language support
- [ ] Conversation history persistence
- [ ] Analytics dashboard for chatbot usage
- [ ] Integration with emergency records
- [ ] Offline mode with cached responses
- [ ] Sentiment analysis
- [ ] User feedback system

## 📞 Support

### Getting Help
- **Technical Issues**: Check troubleshooting section
- **API Questions**: Visit [Gemini API Documentation](https://ai.google.dev/docs)
- **Feature Requests**: Contact development team

## 🔐 Security Best Practices

### Production Deployment

1. **Use Backend Proxy**
   - Don't expose API keys in frontend
   - Create a backend endpoint that calls Gemini
   - Frontend calls your backend instead

2. **Environment Variables**
   - Store keys in environment variables
   - Use secrets management service
   - Never commit keys to git

3. **Rate Limiting**
   - Implement user-based rate limiting
   - Prevent abuse
   - Monitor usage patterns

4. **Data Privacy**
   - Don't send sensitive patient data to AI
   - Anonymize user information
   - Comply with HIPAA if applicable

## ✅ Checklist

- [x] Gemini API key configured
- [x] Chatbot component created
- [x] Integrated into App.tsx
- [x] Safety filters enabled
- [x] Premium design implemented
- [x] Quick actions added
- [x] Error handling implemented
- [ ] Backend proxy (recommended for production)
- [ ] Usage monitoring setup
- [ ] User testing completed

---

**Last Updated**: January 17, 2026
**Version**: 1.0.0
**Powered by**: Google Gemini AI
