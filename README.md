# Smart Energy Predictor - Bug Fixes & Corrections

## Summary of Issues Fixed

### 1. **Missing Chatbot Endpoint (CRITICAL BUG)**
**Problem**: The `chatbot.html` file was calling `/chatbot/chat` endpoint, but this endpoint didn't exist in `app.py`. This caused the chatbot to completely fail.

**Solution**: Added the `/chatbot/chat` endpoint to handle conversational queries with pre-built responses for common energy-related questions.

```python
@app.route('/chatbot/chat', methods=['POST'])
def chatbot_chat():
    """Chatbot conversation endpoint"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.json
    user_message = data.get('message', '')
    
    if not user_message:
        return jsonify({'error': 'No message'}), 400
    
    response = get_chatbot_response(user_message)
    return jsonify({'response': response})
```

### 2. **Device Data Not Being Sent**
**Problem**: The prediction form wasn't properly collecting and sending device data to the backend.

**Solution**: Updated the prediction endpoint to accept device data from the frontend and properly store it in the device profile.

### 3. **Chatbot Response Function**
Added comprehensive `get_chatbot_response()` function that handles common energy-related queries:
- Peak hours information
- High bill explanations
- Device consumption details
- Energy-saving tips
- Solar/renewable energy info
- Temperature optimization
- And more...

## How to Run the Corrected Application

### Prerequisites
```bash
pip install flask flask-sqlalchemy werkzeug python-dotenv pandas pypdf2 requests
```

### Environment Setup
Create a `.env` file:
```
FLASK_SECRET_KEY=your-super-secret-key-here
OPENWEATHER_API_KEY=your-api-key-here  # Optional
```

### Running the Application
```bash
python app.py
```

The app will be available at: `http://127.0.0.1:5000`

## File Structure
```
project/
├── app.py                  # Main Flask application (CORRECTED)
├── templates/
│   ├── base.html
│   ├── home.html
│   ├── about.html
│   ├── login.html
│   ├── signup.html
│   ├── prediction.html
│   ├── chatbot.html
│   ├── contact.html
│   └── device_survey.html
├── energy_predictor.db     # SQLite database (auto-created)
└── uploads/                # File upload directory
```

## Key Features Working

### ✅ Authentication System
- User registration and login
- Password hashing with werkzeug security
- Session management

### ✅ Prediction Engine
- Form-based energy prediction
- Weather integration (with API key)
- Device profile integration
- Personalized suggestions
- Historical predictions chart

### ✅ Chatbot Assistant (NOW WORKING!)
- Conversational AI responses
- Energy-saving tips
- Peak hours information
- Device consumption guidance
- Quick action buttons

### ✅ Device Survey
- Track household appliances
- Personalized recommendations based on devices

### ✅ Contact Form
- User feedback collection
- Rating system

## API Endpoints

### Authentication
- `POST /login` - User login
- `POST /signup` - User registration
- `GET /logout` - User logout

### Main Pages
- `GET /home` - Home page
- `GET /about` - About page
- `GET /prediction` - Prediction page
- `GET /chatbot` - Chatbot page
- `GET /contact` - Contact page
- `GET /device-survey` - Device survey page

### API Endpoints
- `POST /prediction` - Make energy prediction
- `POST /chatbot/chat` - **NEW!** Chatbot conversation
- `GET /api/weather/<city>` - Get weather data
- `GET /api/prediction_history` - Get user's prediction history
- `POST /prediction/upload` - Upload CSV/PDF for batch predictions

## Database Schema

### User Table
- id, email, password
- Relationships: predictions, device_profile

### Prediction Table
- id, user_id, timestamp
- temperature, humidity, square_footage, occupancy
- hvac_usage, lighting_usage, renewable_energy
- predicted_consumption

### DeviceProfile Table
- id, user_id
- tvs, refrigerators, washing_machines, dryers
- computers, ac_units, water_heaters, dishwashers
- updated_at

### Contact Table
- id, name, email, query, rating, timestamp

## Testing the Chatbot

Try these example queries:
1. "Hi" - Get a greeting
2. "What are peak hours?" - Learn about peak energy times
3. "Why is my bill high?" - Get bill analysis
4. "Which devices use most energy?" - See top consumers
5. "How can I save?" - Get energy-saving tips
6. "Tell me about solar" - Learn about renewable options

## Notes
- The mock energy model is simplified for demonstration
- Weather API key is optional (uses mock data if not provided)
- File upload feature is stubbed (can be implemented fully if needed)
- All passwords are hashed before storage
- Session-based authentication throughout

## Troubleshooting

### Chatbot Not Responding?
- Check browser console for errors
- Verify `/chatbot/chat` endpoint is accessible
- Ensure user is logged in (check session)

### Weather Not Loading?
- Get free API key from https://openweathermap.org/api
- Add to .env file as OPENWEATHER_API_KEY
- Or use mock data (default behavior)

### Database Errors?
- Delete `energy_predictor.db` and restart
- Database will be recreated automatically

## Future Enhancements
- Real machine learning model integration
- Advanced file parsing for CSV/PDF uploads
- Real-time energy monitoring dashboard
- Mobile app integration
- Social features (energy challenges)
