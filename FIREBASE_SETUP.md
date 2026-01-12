# Firebase Setup Guide

## Overview

The Firebase service account credentials are stored securely and are **NOT** committed to git (for security reasons). This guide explains how to set up Firebase for both local development and production deployments.

## Local Development Setup

### Option 1: Use the JSON File (Recommended for Local)

1. Make sure `firebase-service-account.json` exists in `src/config/` directory
2. The file should already be there (it's in `.gitignore` so it won't be committed)
3. Run your server: `npm run dev` or `npm start`
4. The app will automatically load the file

### Option 2: Use Environment Variable (Alternative for Local)

1. Get the JSON string by running:
   ```bash
   node scripts/convert-firebase-to-env.js
   ```

2. Copy the JSON string output

3. Add to your `.env` file:
   ```
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
   ```

4. Restart your server

## Production/Server Setup (Render.com, Railway, etc.)

**The file is NOT in git, so you MUST use environment variables on the server.**

### Step 1: Get the JSON String

Run this command locally:
```bash
node scripts/convert-firebase-to-env.js
```

This will output a single-line JSON string. **Copy the entire string.**

### Step 2: Set Environment Variable on Your Hosting Platform

#### For Render.com:

1. Go to your Render.com dashboard
2. Select your backend service
3. Click on **Environment** tab
4. Click **Add Environment Variable**
5. Set:
   - **Key**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: [Paste the entire JSON string from Step 1]
6. Click **Save Changes**
7. **Redeploy** your service

#### For Railway:

1. Go to your Railway project dashboard
2. Select your service
3. Go to **Variables** tab
4. Click **New Variable**
5. Set:
   - **Key**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: [Paste the entire JSON string from Step 1]
6. Save and redeploy

#### For Heroku:

```bash
heroku config:set FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```

### Step 3: Verify

After setting the environment variable and redeploying, check your server logs. You should see:
```
✅ Loaded Firebase service account from environment variable
✅ Firebase Admin SDK initialized successfully
```

## Troubleshooting

### Error: "Firebase service account not found"

**Local Development:**
- Make sure `src/config/firebase-service-account.json` exists
- Check the file path in the error message
- Try running: `node scripts/convert-firebase-to-env.js` to verify the file is readable

**Production/Server:**
- Verify the `FIREBASE_SERVICE_ACCOUNT` environment variable is set
- Make sure the JSON string is complete (no line breaks)
- Check that you redeployed after setting the variable
- Verify the JSON is valid by checking server logs

### Error: "Invalid FIREBASE_SERVICE_ACCOUNT JSON"

- The JSON string might have line breaks - it must be on a single line
- Make sure all quotes are properly escaped
- Use the `convert-firebase-to-env.js` script to get the correct format

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `firebase-service-account.json` to git
- The file is already in `.gitignore`
- Always use environment variables in production
- Keep your service account credentials secure

## Quick Reference

| Environment | Method | Location |
|------------|--------|----------|
| Local Dev | File | `src/config/firebase-service-account.json` |
| Production | Env Var | `FIREBASE_SERVICE_ACCOUNT` environment variable |

