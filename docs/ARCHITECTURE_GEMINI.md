# 🏗️ Gemini AI Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          Frontend (React)                        │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Routines   │  │     Chat     │  │   Products   │          │
│  │     Page     │  │     Page     │  │     Page     │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┴──────────────────┘                  │
│                            │                                      │
│                   ┌────────▼────────┐                            │
│                   │   api.ts        │                            │
│                   │  (Axios)        │                            │
│                   └────────┬────────┘                            │
└─────────────────────────────┼──────────────────────────────────┘
                              │ HTTP + JWT
                              │
┌─────────────────────────────▼──────────────────────────────────┐
│                     Backend (Express.js)                         │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    API Routes Layer                        │  │
│  │  POST /api/routines/generate                              │  │
│  │  POST /api/chat/message                                   │  │
│  └───────────────────────┬────────────────────────────────────┘  │
│                          │                                        │
│  ┌───────────────────────▼────────────────────────────────────┐  │
│  │                  Controllers Layer                          │  │
│  │                                                             │  │
│  │  ┌──────────────────┐      ┌──────────────────┐          │  │
│  │  │ routineController│      │  chatController   │          │  │
│  │  │  .generateRoutine│      │  .sendMessage     │          │  │
│  │  └────────┬─────────┘      └────────┬─────────┘          │  │
│  └───────────┼──────────────────────────┼─────────────────────┘  │
│              │                          │                         │
│  ┌───────────▼──────────────────────────▼─────────────────────┐  │
│  │              Services Layer (NEW!)                          │  │
│  │                                                             │  │
│  │  ┌────────────────────────────────────────────────────┐   │  │
│  │  │         geminiService.js                           │   │  │
│  │  │                                                     │   │  │
│  │  │  • getGeminiResponse(prompt)                      │   │  │
│  │  │  • generateSkincareRoutine(params)                │   │  │
│  │  │  • buildChatPrompt(context)                       │   │  │
│  │  │  • Error handling & retry logic                   │   │  │
│  │  │  • Fallback to rule-based logic                   │   │  │
│  │  └──────────────────────┬─────────────────────────────┘   │  │
│  └─────────────────────────┼───────────────────────────────────┘  │
│                            │                                       │
│                            │ HTTPS                                │
│                            │                                       │
└────────────────────────────┼──────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Google Cloud   │
                    │                 │
                    │  Gemini API     │
                    │  (gemini-pro)   │
                    │                 │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   AI Response   │
                    │   (JSON/Text)   │
                    └─────────────────┘
```

---

## Data Flow: Routine Generation

```
1. User Action
   ├─ Click "Generate Morning Routine"
   └─ Frontend: routines.tsx

2. API Request
   ├─ POST /api/routines/generate
   ├─ Headers: { Authorization: "Bearer <JWT>" }
   └─ Body: { type: "morning" }

3. Backend Processing
   ├─ routineController.generateRoutine()
   ├─ Fetch user products from MongoDB
   ├─ Get user profile (skin type, concerns)
   └─ Build context

4. AI Service Call
   ├─ geminiService.generateSkincareRoutine()
   ├─ Build detailed prompt with:
   │   ├─ User's skin type
   │   ├─ Skin concerns
   │   ├─ Available products
   │   ├─ Product ingredients
   │   └─ Routine type
   └─ Send to Gemini API

5. Gemini AI Processing
   ├─ Analyzes user context
   ├─ Evaluates products
   ├─ Checks ingredient compatibility
   ├─ Determines optimal order
   └─ Generates JSON response:
       {
         "steps": [...],
         "compatibilityWarnings": [...],
         "tips": [...]
       }

6. Response Processing
   ├─ Parse AI response
   ├─ Match products to user's collection
   ├─ Create routine in MongoDB
   └─ Populate product details

7. Frontend Update
   ├─ Receive routine data
   ├─ Update UI with steps
   ├─ Show compatibility warnings
   └─ Display AI tips
```

---

## Data Flow: Chat Message

```
1. User Action
   ├─ Type message: "Can I use retinol with vitamin C?"
   └─ Frontend: chat.tsx

2. API Request
   ├─ POST /api/chat/message
   └─ Body: { content: "Can I use retinol with vitamin C?" }

3. Backend Processing
   ├─ chatController.sendMessage()
   ├─ Save user message to MongoDB
   ├─ Fetch context:
   │   ├─ User profile
   │   ├─ User's products
   │   └─ User's routines
   └─ Build context-aware prompt

4. AI Service Call
   ├─ geminiService.getGeminiResponse()
   ├─ Prompt includes:
   │   ├─ User's question
   │   ├─ Skin type & concerns
   │   ├─ Products they own
   │   └─ Current routines
   └─ Send to Gemini API

5. Gemini AI Processing
   ├─ Understands question context
   ├─ References user's specific products
   ├─ Considers their skin profile
   └─ Generates personalized answer

6. Response Processing
   ├─ Receive AI response
   ├─ Save assistant message to MongoDB
   ├─ Track metadata (model, response time)
   └─ Clean up old messages

7. Frontend Update
   ├─ Display user message
   ├─ Show AI response
   ├─ Update chat history
   └─ Auto-scroll to bottom
```

---

## Component Interaction Map

```
Frontend Components:
├─ Routines.tsx
│  ├─ Uses: routinesAPI.generateAI()
│  ├─ Triggers: Backend AI routine generation
│  └─ Displays: AI-generated steps + warnings
│
├─ Chat.tsx
│  ├─ Uses: chatAPI.sendMessage()
│  ├─ Triggers: Backend AI chat response
│  └─ Displays: Conversational AI messages
│
└─ Products.tsx
   ├─ Manages: Product CRUD
   └─ Provides data for AI context

Backend Controllers:
├─ routineController.js
│  ├─ Uses: geminiService.generateSkincareRoutine()
│  ├─ Fallback: generateRoutineFallback()
│  └─ Returns: Structured routine + metadata
│
└─ chatController.js
   ├─ Uses: geminiService.getGeminiResponse()
   ├─ Fallback: generateAIResponse()
   └─ Returns: Conversational response + context

AI Service:
└─ geminiService.js
   ├─ Core Functions:
   │  ├─ getGeminiResponse(prompt)
   │  └─ generateSkincareRoutine(params)
   ├─ Features:
   │  ├─ Error handling
   │  ├─ Retry logic
   │  ├─ Safety settings
   │  └─ JSON parsing
   └─ External: Google Gemini API
```

---

## Error Handling Flow

```
Request → Controller → AI Service → Gemini API
                          │
                          ├─ Success ✅
                          │  └─ Return AI response
                          │
                          ├─ Rate Limit (429) ⚠️
                          │  └─ Use fallback logic
                          │
                          ├─ Invalid Key (401) ❌
                          │  └─ Return error + use fallback
                          │
                          ├─ Network Error 🌐
                          │  └─ Retry or use fallback
                          │
                          └─ Invalid Response 📄
                             └─ Parse error → use fallback

Fallback Logic:
├─ Rule-based routine generation
├─ Keyword-based chat responses
└─ User never sees error
```

---

## Database Schema Integration

```
MongoDB Collections:

┌─────────────┐
│    Users    │
│             │
│ • skinType  │────┐
│ • concerns  │    │ Used by AI
└─────────────┘    │ for context
                   │
┌─────────────┐    │
│  Products   │    │
│             │────┤
│ • name      │    │
│ • type      │    │
│ • ingredients    │
└─────────────┘    │
                   │
┌─────────────┐    │
│  Routines   │    │
│             │◄───┘
│ • isAI...   │ Generated by
│ • steps[]   │ Gemini AI
│ • warnings  │
└─────────────┘

┌─────────────┐
│ ChatMessages│
│             │
│ • role      │ user/assistant
│ • content   │ AI generated
│ • context   │ products/routines
│ • metadata  │ model, time
└─────────────┘
```

---

## Security Architecture

```
┌────────────────────────────────────────┐
│         Environment Variables           │
│  GEMINI_API_KEY=AIzaSy...              │
│  (Never committed to Git)              │
└────────────────┬───────────────────────┘
                 │
                 │ Loaded via dotenv
                 │
┌────────────────▼───────────────────────┐
│          Backend Server                 │
│  • Validates API key on startup        │
│  • Uses HTTPS for Gemini calls         │
│  • JWT authentication required         │
│  • Rate limiting enabled               │
└────────────────┬───────────────────────┘
                 │
                 │ Secure HTTPS
                 │
┌────────────────▼───────────────────────┐
│         Gemini API                      │
│  • Safety filters active               │
│  • Content moderation                  │
│  • Rate limit protection               │
└────────────────────────────────────────┘
```

---

## Performance Optimization

```
Request Lifecycle:

User Action (0ms)
     │
     ├─ Frontend validates (< 10ms)
     │
     ├─ API call sent (10-50ms network)
     │
     ├─ Backend processing:
     │  ├─ Auth check (< 5ms)
     │  ├─ DB queries (50-200ms)
     │  └─ Context building (< 10ms)
     │
     ├─ Gemini API call:
     │  ├─ Request sent (50ms)
     │  ├─ AI processing (1-4 seconds) ⏱️
     │  └─ Response received (50ms)
     │
     ├─ Response processing:
     │  ├─ JSON parsing (< 10ms)
     │  ├─ DB save (50-100ms)
     │  └─ Populate (100ms)
     │
     └─ Frontend update (< 50ms)

Total: ~2-5 seconds for AI responses

Optimization Strategies:
├─ Cache common questions/responses
├─ Parallel DB queries
├─ Optimistic UI updates
└─ Loading states
```

---

## Deployment Architecture

```
Development:
┌──────────────┐      ┌──────────────┐
│  Frontend    │      │  Backend     │
│  :8080       │◄────►│  :5001       │◄──── Gemini API
│  (Vite Dev)  │      │  (Nodemon)   │
└──────────────┘      └──────────────┘

Production:
┌──────────────┐      ┌──────────────┐
│  Frontend    │      │  Backend     │
│  (Vercel/    │      │  (Railway/   │
│   Netlify)   │◄────►│   Render)    │◄──── Gemini API
│              │      │              │
│  Static      │      │  + MongoDB   │
│  Assets      │      │    Atlas     │
└──────────────┘      └──────────────┘
```

---

## Testing Architecture

```
Test Levels:

1. Unit Tests
   ├─ geminiService.js
   │  ├─ Mock API responses
   │  ├─ Test error handling
   │  └─ Validate parsing
   │
   └─ Controllers
      ├─ Mock service calls
      └─ Test fallback logic

2. Integration Tests
   ├─ Test script: npm run test:gemini
   │  ├─ API key validation
   │  ├─ Simple response test
   │  └─ Routine generation test
   │
   └─ Manual testing
      ├─ Frontend UI testing
      └─ End-to-end flows

3. Load Testing
   ├─ Rate limit handling
   ├─ Response times
   └─ Fallback reliability
```

---

This architecture ensures:
✅ Scalability
✅ Reliability (fallbacks)
✅ Security (API key protection)
✅ Performance (optimized flows)
✅ Maintainability (clean separation)
