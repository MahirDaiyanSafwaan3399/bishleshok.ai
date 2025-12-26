# Vercel Deployment Setup Guide

## Environment Variables Required

Add these environment variables in your Vercel project settings:

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Select your project: `bishleshok.ai`

### 2. Navigate to Settings → Environment Variables

### 3. Add the following variables:

#### Google Gemini API Key
```
Name: VITE_GEMINI_API_KEY
Value: AIzaSyA2oWaeypMCMYcvuO2T5UaQv8vxz_0n1bQ
```

#### Firebase Configuration
```
Name: VITE_FIREBASE_API_KEY
Value: AIzaSyAKTCCN07XHfFyDy8PD84qsWqkSRUmpfh4

Name: VITE_FIREBASE_AUTH_DOMAIN
Value: bishleshok.firebaseapp.com

Name: VITE_FIREBASE_PROJECT_ID
Value: bishleshok

Name: VITE_FIREBASE_STORAGE_BUCKET
Value: bishleshok.firebasestorage.app

Name: VITE_FIREBASE_MESSAGING_SENDER_ID
Value: 643251316933

Name: VITE_FIREBASE_APP_ID
Value: 1:643251316933:web:270ad8097a2400543828ac

Name: VITE_FIREBASE_MEASUREMENT_ID
Value: G-QPMJWMDLWT
```

### 4. Important Settings
- ✅ Check **Production**
- ✅ Check **Preview**
- ✅ Check **Development**

### 5. After Adding Variables
- Vercel will automatically trigger a new deployment
- Or manually redeploy from the Deployments tab
- Wait for the build to complete

### 6. Verify
- Visit your site: https://bishleshok-ai.vercel.app/
- The app should now load correctly with all features working

## Troubleshooting

If the page is still blank after adding environment variables:
1. Check browser console (F12) for errors
2. Verify all environment variables are correctly named (must start with `VITE_`)
3. Ensure variables are set for the correct environment (Production/Preview/Development)
4. Check Vercel build logs for any errors during build

