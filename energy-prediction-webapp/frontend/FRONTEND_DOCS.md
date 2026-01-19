# Frontend Documentation

## Project Structure

```
src/
├── components/        # Reusable React components
│   ├── Navbar.jsx    # Navigation bar
│   ├── Chart.jsx     # Chart wrapper
│   ├── FileUpload.jsx # File upload handler
│   ├── LoadingSpinner.jsx
│   ├── Toast.jsx     # Notification component
│   └── ProtectedRoute.jsx
├── pages/            # Page components
│   ├── Login.jsx
│   ├── Home.jsx
│   ├── FormPrediction.jsx
│   ├── UploadPrediction.jsx
│   ├── Report.jsx
│   └── Chatbot.jsx
├── services/         # API service functions
│   └── api.js
├── context/          # React context providers
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── App.jsx          # Main app component
├── main.jsx         # Entry point
└── index.css        # Tailwind styles
```

## Key Components

### Navbar
Navigation bar with theme toggle and authentication controls.

```jsx
<Navbar />
```

Features:
- Dynamic routing based on authentication
- Dark/Light theme toggle
- Mobile responsive menu
- Logout functionality

### Chart Component
Wrapper around Recharts for consistent styling.

```jsx
<EnergyChart data={chartData} type="area|line|bar" />
```

### FileUpload Component
Drag-and-drop file upload interface.

```jsx
<FileUpload 
  onFileSelect={handleFileSelect}
  accept=".csv,.pdf,.txt"
/>
```

### Toast Notifications
Display temporary notifications.

```jsx
<Toast 
  message="Success message"
  type="success|error|info|warning"
  onClose={handleClose}
/>
```

### ProtectedRoute
Wrapper for routes requiring authentication.

```jsx
<ProtectedRoute>
  <ComponentRequiringAuth />
</ProtectedRoute>
```

## Context API

### AuthContext
Manages authentication state and functions.

```jsx
const { user, token, isAuthenticated, login, signup, logout } = useContext(AuthContext);
```

**Methods:**
- `login(email, password)` - Authenticate user
- `signup(email, password, name)` - Create new account
- `logout()` - Clear authentication

### ThemeContext
Manages dark/light theme.

```jsx
const { isDark, toggleTheme } = useContext(ThemeContext);
```

## API Services

All API calls are centralized in `src/services/api.js`.

### Auth Service
```javascript
authService.login(email, password)
authService.signup(email, password, name)
authService.getProfile()
```

### Prediction Service
```javascript
predictionService.predictForm(data)
predictionService.predictFile(file)
```

### Chatbot Service
```javascript
chatbotService.sendMessage(message)
chatbotService.sendVoice(audioFile)
```

### Report Service
```javascript
reportService.getSummary()
```

### Model Service
```javascript
modelService.getInfo()
```

## Pages

### Login Page
- Handles both login and signup
- Form validation
- Demo credentials display
- Error handling

### Home Page
- Project introduction
- Feature highlights
- Call-to-action buttons
- Responsive grid layout

### Form Prediction
- Form with sliders for parameters
- Real-time value display
- Prediction results display
- Input parameter review

### Upload Prediction
- Drag-and-drop file upload
- Batch processing
- Detailed results table
- File type validation

### Report Page
- Key metrics cards
- Interactive charts
- Multiple chart types
- Performance metrics
- Recommendations

### Chatbot Page
- Message interface
- Voice input/output
- Suggested questions
- Auto-scroll to latest message
- Loading states

## Styling with Tailwind CSS

### Custom Utilities
```css
.btn - Base button styles
.btn-primary - Primary button
.btn-secondary - Secondary button
.card - Card container
.input-field - Form input
.fade-in - Fade animation
.slide-in - Slide animation
```

## State Management

### Component-Level State
Used for form data, loading states, and UI toggles.

```jsx
const [formData, setFormData] = useState({...});
const [loading, setLoading] = useState(false);
```

### Context State
Shared across app for auth and theme.

```jsx
const { isAuthenticated } = useContext(AuthContext);
const { isDark } = useContext(ThemeContext);
```

## API Error Handling

Consistent error handling pattern:

```jsx
try {
  const response = await apiService.method();
  setData(response.data);
} catch (error) {
  const errorMessage = error.response?.data?.error || 'An error occurred';
  setToast({ type: 'error', message: errorMessage });
}
```

## Forms

### Form Prediction Form
- Temperature input (slider)
- Humidity input (slider)
- Square footage input (number)
- Month selection (dropdown)
- Real-time value display

### File Upload
- Drag-and-drop zone
- File selection dialog
- File type validation
- Size validation
- Progress feedback

## Charts

### Supported Types
1. **Area Chart** - Filled area under line
2. **Line Chart** - Connected data points
3. **Bar Chart** - Vertical bars

All charts include:
- Grid lines
- Axis labels
- Tooltip on hover
- Legend
- Responsive sizing

## Responsive Design

### Breakpoints (Tailwind)
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Grid Layouts
```jsx
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Responsive grid */}
</div>
```

## Performance Optimization

### Code Splitting
Routes are component-based for lazy loading potential.

### Memoization
Use `useCallback` for event handlers.

```jsx
const handleSubmit = useCallback(async (data) => {
  // Handle submission
}, [dependencies]);
```

### Image Optimization
Use appropriate image formats and sizes.

## Accessibility

- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Color contrast compliance
- Focus states for buttons

## Browser DevTools

### React DevTools
Install React DevTools extension for debugging component tree.

### Console
Check for warnings and errors during development.

### Network Tab
Monitor API calls and responses.

## Build Optimization

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

Generates optimized bundle in `dist/` folder.

### Preview Build
```bash
npm run preview
```

## Environment Variables

Create `.env` file in frontend root:
```
VITE_API_URL=http://localhost:5000/api
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Common Issues

### API Connection Failed
- Check backend server is running
- Verify CORS settings
- Check network tab for failed requests

### Voice Not Working
- Requires HTTPS or localhost
- Check browser permissions
- Verify browser support

### Theme Toggle Not Persisting
- Consider adding localStorage persistence
- Check ThemeContext implementation

### Slow Performance
- Check Chart data size
- Consider pagination for large datasets
- Use React DevTools Profiler

## Future Enhancements

- [ ] Component library documentation
- [ ] Storybook integration
- [ ] E2E testing with Cypress
- [ ] Unit tests with Vitest
- [ ] Internationalization (i18n)
- [ ] Advanced state management (Redux)
- [ ] Service Worker for PWA
