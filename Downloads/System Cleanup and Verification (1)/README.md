
  # System Cleanup and Verification

  This is a code bundle for System Cleanup and Verification. The original project is available at https://www.figma.com/design/kN2KbRDDdUTWB7CinGdhGO/System-Cleanup-and-Verification.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
## 🚀 Deployment

### Quick Deploy (Recommended)

1. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual API keys
   ```

2. **Deploy to Vercel:**
   ```bash
   npm i -g vercel
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY`

### Alternative Deployments

- **Netlify:** `netlify deploy --prod --dir=build`
- **Firebase:** `firebase deploy`
- **Manual:** Upload `build/` folder to any static hosting

### Environment Variables Required

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GEMINI_API_KEY=your_gemini_key
```

See `DEPLOYMENT_ANALYSIS.md` for detailed instructions.  