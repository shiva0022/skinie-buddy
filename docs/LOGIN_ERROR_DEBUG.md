# Login Error - Troubleshooting Guide
*Generated: November 1, 2025*

## ✅ Fixes Applied

### 1. **Fixed Auth.tsx Toast Import** 
- **Issue**: Auth.tsx was importing `useToast()` from hooks but AuthContext uses `toast` from sonner
- **Fix**: Removed unused import to ensure consistent error handling
- **File**: `Frontend/src/pages/Auth.tsx`

### 2. **Added Streak Data to Registration Response**
- **Issue**: Register endpoint wasn't returning streak data, causing potential undefined errors
- **Fix**: Now returns streak data in registration response matching login format
- **File**: `Backend/controllers/authController.js`

---

## 🧪 Backend API Testing Results

### ✅ Registration Endpoint - WORKING
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"testuser@example.com","password":"test123456"}'
```
**Response**: ✅ Success (201) - Returns user, streak, and token

### ✅ Login Endpoint - WORKING
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"test123456"}'
```
**Response**: ✅ Success (200) - Returns user, streak, and token

### ✅ Backend Status
- Server running on port **5001** ✅
- MongoDB connected ✅
- CORS configured for `http://localhost:8080` ✅

### ✅ Frontend Status
- Dev server running on port **8080** ✅
- Build successful ✅
- No TypeScript errors ✅

---

## 🔍 How to Identify the Specific Login Error

Since both servers are running and the API works via curl, the issue is likely on the frontend. Here's how to debug:

### Step 1: Open Browser DevTools
1. Open your browser and go to `http://localhost:8080`
2. Press **F12** or **Cmd+Option+I** to open DevTools
3. Go to the **Console** tab

### Step 2: Try to Login/Signup
1. Try to sign up with a new account:
   - Name: Any name
   - Email: `yourtest@example.com`
   - Password: At least 6 characters
2. Watch the Console for errors

### Step 3: Check Network Tab
1. Go to **Network** tab in DevTools
2. Try logging in again
3. Look for the request to `/api/auth/login` or `/api/auth/register`
4. Click on it and check:
   - **Status Code**: Should be 200 or 201
   - **Response**: Check if there's an error message
   - **Headers**: Verify CORS headers are present

---

## 🐛 Common Login Errors & Solutions

### Error 1: "Network Error" or "Failed to fetch"
**Cause**: Frontend can't reach backend  
**Check**:
```bash
# Verify backend is running
lsof -ti:5001

# Test health endpoint
curl http://localhost:5001/api/health
```

### Error 2: CORS Error in Console
**Symptom**: `Access-Control-Allow-Origin` error  
**Solution**: 
- Backend CORS is already configured for `http://localhost:8080`
- Make sure frontend is running on port 8080 (not 5173)
- Check with: `lsof -ti:8080`

### Error 3: "Invalid email or password"
**Cause**: User doesn't exist or wrong credentials  
**Solution**: 
- Try signing up first with a new account
- Password must be at least 6 characters

### Error 4: Toast doesn't show
**Cause**: Sonner provider not in component tree  
**Check**: Verify `<Toaster />` is in `Frontend/src/main.tsx`

### Error 5: JWT Token Not Stored
**Check Browser Storage**:
1. DevTools → Application tab → Local Storage
2. Look for `authToken` and `isAuthenticated`
3. If missing after successful login, check AuthContext

---

## 🔧 Quick Test Commands

### Test Backend Health
```bash
curl http://localhost:5001/api/health
# Should return: {"success":true,"message":"Server is running","timestamp":"..."}
```

### Test Frontend API Config
Check if `Frontend/.env` has:
```
VITE_API_URL=http://localhost:5001
```

### Restart Both Servers
```bash
# Terminal 1 - Backend
cd Backend
npm start

# Terminal 2 - Frontend  
cd Frontend
npm run dev
```

---

## 📋 Full Login Flow Checklist

- [x] Backend running on port 5001
- [x] Frontend running on port 8080
- [x] MongoDB connected
- [x] CORS configured correctly
- [x] API endpoints working (tested via curl)
- [x] Auth.tsx toast import fixed
- [x] Register returns streak data
- [ ] **Need to check**: Browser console for actual error
- [ ] **Need to check**: Network tab for failed requests
- [ ] **Need to check**: Local storage after login attempt

---

## 🚨 What to Look For

When you try to login, please check:

1. **Console Tab** - Look for red error messages
2. **Network Tab** - Check `/api/auth/login` request status
3. **Local Storage** - Check if `authToken` is saved

Then share:
- The exact error message from Console
- The HTTP status code from Network tab
- Any CORS-related errors
- Whether registration works but login doesn't (or vice versa)

---

## 💡 Most Likely Issues

Based on the setup, the most probable causes are:

1. **Password too short**: Must be 6+ characters
2. **User doesn't exist**: Try signup first
3. **Old token in localStorage**: Clear it and try again:
   ```javascript
   // In browser console:
   localStorage.clear();
   ```
4. **Wrong port**: Frontend must be on 8080 (CORS configured for that)

---

## 🎯 Next Steps

1. **Clear browser cache and localStorage**:
   - DevTools → Application → Storage → Clear site data
   
2. **Try fresh signup**:
   - Use a completely new email
   - Password: `testpassword123`
   
3. **Check browser console** for the exact error

4. **Share the error** so I can provide a specific fix

---

## 📝 Test Account Created

You can try logging in with this test account:
- **Email**: `testuser@example.com`
- **Password**: `test123456`

This account was created during testing and confirmed working via curl.

