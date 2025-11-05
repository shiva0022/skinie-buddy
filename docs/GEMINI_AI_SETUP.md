# 🤖 Gemini AI Integration Setup Guide

## Overview

This guide will help you set up Google's Gemini AI for generating personalized skincare routines and providing intelligent chat responses in your Skinie Buddy application.

---

## 🎯 Features Enabled

✅ **AI-Powered Routine Generation** - Generates personalized morning/night routines based on:
  - User's products
  - Skin type
  - Skin concerns
  - Product ingredients
  - Usage patterns

✅ **Intelligent Chat Assistant** - Provides context-aware skincare advice:
  - Answers questions about ingredients
  - Suggests product order
  - Detects compatibility issues
  - Personalized to user's products and profile

✅ **Fallback Logic** - Gracefully handles API failures with rule-based responses

---

## 📋 Prerequisites

1. **Node.js** installed (v16 or higher)
2. **MongoDB** running (local or Atlas)
3. **Google Account** for accessing Gemini API

---

## 🚀 Setup Instructions

### Step 1: Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy your API key (starts with `AIza...`)

**Important:** Keep your API key secure and never commit it to version control!

### Step 2: Configure Environment Variables

1. Navigate to the Backend folder:
   ```bash
   cd Backend
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your Gemini API key:
   ```bash
   # Google Gemini AI API
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

### Step 3: Install Dependencies

Install axios (required for Gemini API calls):
```bash
npm install
```

Or specifically:
```bash
npm install axios
```

### Step 4: Restart Backend Server

If your server is running, restart it to load the new environment variables:
```bash
npm run dev
```

You should see:
```
🚀 Server running in development mode on port 5001
✅ MongoDB Connected: cluster0.mongodb.net
```

---

## 🧪 Testing the Integration

### Test 1: Generate AI Routine

1. **Login to your app** (http://localhost:8080)
2. **Add some products** in the Products page (at least 3-4 products)
3. **Go to Routines page**
4. **Click "Generate Morning Routine"** or use the "Regenerate" button

**Expected Result:**
- AI analyzes your products
- Creates a customized routine with proper order
- Includes detailed instructions for each step
- Warns about ingredient conflicts

### Test 2: AI Chat Assistant

1. **Go to Chat page**
2. **Ask questions** like:
   - "What order should I use my products?"
   - "Can I use retinol with vitamin C?"
   - "How should I treat dry skin?"
   - "What's the best routine for anti-aging?"

**Expected Result:**
- AI provides personalized answers
- References your specific products when relevant
- Gives actionable advice

### Test 3: API Testing with Postman/cURL

**Generate Routine:**
```bash
curl -X POST http://localhost:5001/api/routines/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "morning"}'
```

**Send Chat Message:**
```bash
curl -X POST http://localhost:5001/api/chat/message \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "What order should I use my products?"}'
```

---

## 🔧 API Configuration

### Gemini API Settings

The service is configured with optimal settings in `services/geminiService.js`:

```javascript
{
  temperature: 0.7,        // Balanced creativity
  topK: 40,               // Top-K sampling
  topP: 0.95,             // Nucleus sampling
  maxOutputTokens: 1024,  // Response length limit
}
```

### Safety Settings

Safety filters are enabled for:
- Harassment
- Hate speech
- Sexually explicit content
- Dangerous content

### Rate Limits

**Gemini API Free Tier:**
- 60 requests per minute
- 1,500 requests per day

**Tips to stay within limits:**
- Implement caching for common questions
- Use fallback logic when rate limited
- Consider upgrading to paid tier for production

---

## 🐛 Troubleshooting

### Issue: "Gemini API key not configured"

**Solution:**
1. Check `.env` file has `GEMINI_API_KEY=your-key-here`
2. Restart the server after adding the key
3. Verify no spaces around the `=` sign

### Issue: "Invalid Gemini API key"

**Solution:**
1. Verify your API key is correct (starts with `AIza`)
2. Check key hasn't expired
3. Ensure API is enabled in Google Cloud Console
4. Try generating a new key

### Issue: "Rate limit exceeded"

**Solution:**
- Wait a few minutes before trying again
- The app automatically falls back to rule-based logic
- Consider implementing caching
- Upgrade to paid tier if needed

### Issue: "Network timeout"

**Solution:**
- Check your internet connection
- Verify firewall isn't blocking API calls
- Try increasing timeout in `geminiService.js`:
  ```javascript
  timeout: 30000 // 30 seconds
  ```

### Issue: "AI generates invalid JSON"

**Solution:**
- This is handled automatically with JSON parsing fallback
- Check server logs for the raw AI response
- The app uses fallback routine generation if parsing fails

---

## 📊 Monitoring & Logs

### Enable Debug Logging

See detailed Gemini API requests/responses:
```javascript
// In geminiService.js, add:
console.log('🤖 Sending to Gemini:', prompt);
console.log('📥 Received from Gemini:', response.data);
```

### Check Server Logs

Look for these indicators:
```
✅ AI routine generated successfully
⚠️  Gemini AI generation failed, using fallback
❌ Gemini API Error: Rate limit exceeded
```

---

## 💰 Cost Considerations

### Free Tier (Current Setup)
- **Cost:** $0
- **Limits:** 60 RPM, 1,500 RPD
- **Best for:** Development & testing

### Paid Tier (Production)
- **Cost:** ~$0.001 per request (varies by model)
- **Limits:** Higher rate limits
- **Features:** Priority access, better models

**Estimated costs for 1000 users:**
- Average 5 requests/user/day = 5,000 requests/day
- Cost: ~$5/day = ~$150/month

---

## 🔒 Security Best Practices

### ✅ DO:
- Store API key in `.env` file
- Add `.env` to `.gitignore`
- Use environment variables in production
- Implement rate limiting on your endpoints
- Validate user input before sending to AI
- Monitor API usage

### ❌ DON'T:
- Commit API keys to Git
- Share API keys publicly
- Hardcode keys in source code
- Send sensitive user data to AI
- Skip input validation

---

## 🚀 Production Deployment

### Environment Variables

Set these in your hosting platform:
```bash
GEMINI_API_KEY=your-production-key
NODE_ENV=production
```

**Popular platforms:**
- **Heroku:** Settings → Config Vars
- **Railway:** Variables tab
- **Render:** Environment → Add variable
- **Vercel:** Settings → Environment Variables

### Recommended Enhancements

1. **Implement Caching:**
   ```javascript
   // Cache common questions/responses
   const cache = new Map();
   ```

2. **Add Request Queue:**
   ```javascript
   // Queue requests to avoid rate limits
   const queue = new PQueue({ concurrency: 1 });
   ```

3. **Monitor Usage:**
   ```javascript
   // Track API calls
   let apiCallCount = 0;
   ```

4. **Implement Retry Logic:**
   ```javascript
   // Retry failed requests with exponential backoff
   ```

---

## 📚 Additional Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API Pricing](https://ai.google.dev/pricing)
- [Rate Limits Guide](https://ai.google.dev/docs/rate_limits)

---

## 🆘 Support

If you encounter issues:

1. **Check logs** - Server console will show detailed errors
2. **Test API key** - Use Google AI Studio playground
3. **Review code** - Check `services/geminiService.js`
4. **Fallback works?** - Verify rule-based logic functions

---

## ✨ Example Prompts That Work Well

### For Routine Generation:
- Morning routine with focus on hydration
- Night routine for anti-aging
- Routine for acne-prone oily skin
- Gentle routine for sensitive skin

### For Chat:
- "What's the difference between AHA and BHA?"
- "Can I use niacinamide with retinol?"
- "How to layer multiple serums?"
- "Best ingredients for dark spots?"
- "When should I apply sunscreen?"

---

## 🎉 Success Indicators

You'll know it's working when:

✅ Routines show detailed, personalized instructions
✅ Chat responses reference your actual products
✅ Compatibility warnings are accurate and specific
✅ AI provides actionable, step-by-step advice
✅ Responses are contextual to user's skin type/concerns

---

**Happy Skincare Routine Building! 🧴✨**
