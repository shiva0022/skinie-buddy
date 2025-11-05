# 🚀 Quick Start: Gemini AI Integration

## What You Get

✅ AI-powered skincare routine generation  
✅ Intelligent chat assistant  
✅ Automatic fallback if AI fails  
✅ Context-aware recommendations  

---

## ⚡ 5-Minute Setup

### 1. Get API Key (2 minutes)

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Get API Key"
4. Copy your key (starts with `AIza...`)

### 2. Configure Backend (1 minute)

```bash
cd Backend

# Add to .env file:
echo "GEMINI_API_KEY=your-key-here" >> .env
```

### 3. Install Dependencies (1 minute)

```bash
npm install
```

### 4. Test Integration (1 minute)

```bash
npm run test:gemini
```

Expected output:
```
🧪 Test 1: Simple Gemini Response
✅ Response received
🧪 Test 2: Skincare Routine Generation
✅ Routine generated successfully!
🎉 All tests passed!
```

### 5. Start Server

```bash
npm run dev
```

---

## 🧪 Quick Test

### Test Routine Generation

1. Login to app (http://localhost:8080)
2. Add 3-4 products
3. Go to Routines → Click "Generate Morning Routine"
4. See AI-generated personalized routine! 🎉

### Test Chat

1. Go to Chat page
2. Ask: "What order should I use my products?"
3. Get personalized AI response! 💬

---

## ❌ Troubleshooting

**"API key not configured"**
→ Check `.env` has `GEMINI_API_KEY=...`

**"Invalid API key"**
→ Get new key from https://makersuite.google.com/app/apikey

**"Rate limit exceeded"**
→ Wait 1 minute, or app uses fallback automatically

---

## 📚 Full Documentation

See [GEMINI_AI_SETUP.md](./GEMINI_AI_SETUP.md) for complete guide.

---

**That's it! You're ready to use AI-powered skincare routines! 🧴✨**
