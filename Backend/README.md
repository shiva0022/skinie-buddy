# Skinie Buddy Backend API

Backend API for Skinie Buddy - Your personalized skincare companion with AI-powered recommendations.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Google Gemini AI** - AI-powered skincare advice 🤖

## Features

- 🔐 User authentication with JWT
- 👤 User profile management
- 📦 Product management (CRUD)
- 📋 Skincare routine management
- 🤖 **AI-powered routine generation (Gemini)**
- 💬 **AI chat assistant (Gemini)**
- 🔥 Streak tracking system
- 🛡️ Security (Helmet, CORS, Rate limiting)
- ✅ Input validation
- 🚨 Error handling

## New: AI Integration 🎯

This backend now integrates with **Google Gemini AI** to provide:
- ✨ Personalized routine generation based on user's products and skin profile
- 💡 Intelligent chat responses for skincare questions
- 🔍 Ingredient compatibility analysis
- 📊 Context-aware recommendations

**Setup Guide:** See [GEMINI_AI_SETUP.md](./GEMINI_AI_SETUP.md) for complete AI setup instructions.

## Installation

1. **Install dependencies:**
```bash
cd Backend
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` and configure your variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skinie-buddy
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:8080
```

3. **Make sure MongoDB is running:**

Local MongoDB:
```bash
mongod
```

Or use MongoDB Atlas (cloud) and update the `MONGODB_URI` in `.env`

4. **Start the server:**

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user (protected)
- `PUT /password` - Update password (protected)

### Users (`/api/users`)
- `GET /profile` - Get user profile (protected)
- `PUT /profile` - Update user profile (protected)
- `DELETE /account` - Delete user account (protected)

### Products (`/api/products`)
- `GET /` - Get all products (protected)
- `GET /:id` - Get single product (protected)
- `POST /` - Create product (protected)
- `PUT /:id` - Update product (protected)
- `DELETE /:id` - Delete product (protected)

### Routines (`/api/routines`)
- `GET /` - Get all routines (protected)
- `GET /:id` - Get single routine (protected)
- `POST /` - Create routine (protected)
- `POST /generate` - Generate AI routine (protected)
- `PUT /:id` - Update routine (protected)
- `DELETE /:id` - Delete routine (protected)
- `POST /:id/complete` - Mark routine as completed (protected)

### Streaks (`/api/streaks`)
- `GET /` - Get user streak (protected)
- `POST /update` - Update streak (protected)

### Chat (`/api/chat`)
- `GET /history` - Get chat history (protected)
- `POST /message` - Send message (protected)
- `DELETE /history` - Clear chat history (protected)

### Health
- `GET /api/health` - Health check endpoint

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

Success response:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Error response:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]
}
```

## Database Models

### User
- name, email, password
- skinType, skinConcerns
- preferences (notifications, theme)

### Product
- name, brand, type
- ingredients, keyIngredients
- usage, compatibility
- price, rating, notes

### Routine
- name, type (morning/night/weekly/custom)
- steps (array of products with instructions)
- isAIGenerated, compatibilityWarnings
- completionCount, lastCompleted

### Streak
- currentStreak, longestStreak
- lastLoginDate, totalLogins
- loginHistory (last 90 days)
- achievements

### ChatMessage
- role (user/assistant)
- content
- context (related products/routines)
- metadata

## Security Features

- Password hashing with bcryptjs
- JWT authentication
- Helmet for HTTP headers security
- CORS configuration
- Rate limiting
- Input validation
- XSS protection

## Error Handling

The API includes comprehensive error handling for:
- Validation errors
- Authentication errors
- Database errors
- Not found errors
- Server errors

## Development

The project uses ES6 modules and includes:
- Nodemon for auto-restart
- Morgan for logging
- Compression for response compression

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a strong `JWT_SECRET`
3. Configure MongoDB Atlas for cloud database
4. Enable HTTPS
5. Set up proper CORS configuration
6. Configure rate limiting appropriately

## Testing the API

You can test the API using:
- Postman
- Thunder Client (VS Code extension)
- cURL
- HTTPie

Example login request:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

## License

ISC
