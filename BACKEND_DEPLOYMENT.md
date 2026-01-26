# Backend Deployment Guide

This guide explains how to deploy the serverless backend for the Attachment Downloader feature.

## Overview

The Attachment Downloader now uses a **serverless backend** to bypass CORS restrictions when downloading Trello attachments. The backend:

- Receives attachment metadata and Trello token from the Power-Up
- Makes authenticated requests to Trello's API with proper OAuth headers
- Downloads all attachments server-side (no CORS issues)
- Creates a ZIP file
- Streams it back to the client

## Why a Backend is Needed

**CORS Limitation**: Trello's attachment S3 bucket doesn't allow cross-origin requests from browser JavaScript. This is a security feature that prevents client-side Power-Ups from directly downloading attachments.

**Trello's Authentication Change (2021)**: Trello now requires OAuth 1.0 Authorization headers (not query parameters) for attachment downloads, which browsers cannot set for CORS requests.

**Solution**: A server-side proxy can make authenticated requests without browser CORS restrictions.

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel offers:
- ✅ Free tier with generous limits
- ✅ Automatic HTTPS
- ✅ GitHub integration
- ✅ Zero configuration
- ✅ Automatic scaling

#### Steps:

1. **Install Vercel CLI** (optional, for local testing):
   ```bash
   npm install -g vercel
   ```

2. **Sign up for Vercel**:
   - Go to https://vercel.com
   - Sign up with your GitHub account

3. **Import this repository**:
   - Click "Add New..." → "Project"
   - Select this repository
   - Vercel will auto-detect the configuration

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - You'll get a URL like: `https://your-project.vercel.app`

5. **Update the Power-Up**:
   - In `js/attachment-downloader.js`, update `getBackendUrl()`:
     ```javascript
     return 'https://your-project.vercel.app/api/download-attachments';
     ```

#### Local Testing with Vercel:

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Or use Vercel CLI
vercel dev
```

This starts a local server at `http://localhost:3000` that mimics Vercel's serverless environment.

---

### Option 2: Netlify

Similar to Vercel, Netlify offers serverless functions:

1. **Convert the function**:
   - Netlify uses a slightly different format
   - Move `api/download-attachments.js` to `netlify/functions/download-attachments.js`

2. **Update `netlify.toml`**:
   ```toml
   [build]
     functions = "netlify/functions"

   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   ```

3. **Deploy**:
   - Connect your GitHub repo to Netlify
   - Deploy automatically

---

### Option 3: AWS Lambda + API Gateway

For more control or existing AWS infrastructure:

1. **Package the function**:
   ```bash
   cd api
   npm install
   zip -r function.zip .
   ```

2. **Create Lambda function**:
   - Runtime: Node.js 18.x
   - Handler: `download-attachments.handler`
   - Upload `function.zip`

3. **Create API Gateway**:
   - Type: REST API
   - Create POST endpoint `/download-attachments`
   - Enable CORS
   - Link to Lambda function

4. **Note the API URL**: `https://YOUR_API_ID.execute-api.REGION.amazonaws.com/prod/download-attachments`

---

### Option 4: Self-Hosted (Docker)

For complete control:

1. **Create Express server**:
   ```javascript
   const express = require('express');
   const cors = require('cors');
   const downloadHandler = require('./api/download-attachments');

   const app = express();
   app.use(cors());
   app.use(express.json());

   app.post('/api/download-attachments', downloadHandler);

   app.listen(3000, () => console.log('Server running on port 3000'));
   ```

2. **Deploy** to any platform (Railway, Render, DigitalOcean, etc.)

---

## Configuration

### Environment Variables

The backend uses the hardcoded Trello API key from the main app. If you want to use environment variables:

1. **Add to Vercel**:
   - Go to Project Settings → Environment Variables
   - Add: `TRELLO_API_KEY=c9df6f6f1cd31f277375aa5dd43041c8`

2. **Update `api/download-attachments.js`**:
   ```javascript
   const APP_KEY = process.env.TRELLO_API_KEY || 'c9df6f6f1cd31f277375aa5dd43041c8';
   ```

### CORS Configuration

The `vercel.json` file includes CORS headers. If using another platform, ensure:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Architecture Diagram

```
┌─────────────────┐
│  Trello Board   │
└────────┬────────┘
         │
         │ (Power-Up iframe)
         ▼
┌─────────────────────────────────┐
│   Client (attachment-downloader.js)   │
│  - Collects attachment metadata │
│  - Gets Trello token            │
└────────┬────────────────────────┘
         │
         │ POST /api/download-attachments
         │ { attachments: [...], token: "..." }
         ▼
┌─────────────────────────────────┐
│   Backend (Vercel Function)     │
│  - Receives request             │
│  - Downloads from Trello API    │
│  - Creates ZIP                  │
│  - Streams back to client       │
└────────┬────────────────────────┘
         │
         │ OAuth headers
         ▼
┌─────────────────────────────────┐
│   Trello API                    │
│  - Authenticates request        │
│  - Serves attachment files      │
└─────────────────────────────────┘
```

---

## Testing

### 1. Local Testing

```bash
npm run dev
```

Test the endpoint:
```bash
curl -X POST http://localhost:3000/api/download-attachments \
  -H "Content-Type: application/json" \
  -d '{
    "attachments": [
      {
        "id": "attachment-id",
        "cardId": "card-id",
        "cardName": "Test Card",
        "name": "test.jpg",
        "fileName": "test.jpg",
        "url": "https://..."
      }
    ],
    "token": "your-trello-token"
  }' \
  --output test.zip
```

### 2. Integration Testing

1. Open Power-Up in Trello
2. Enable debug mode: Add `?debug=true` to URL
3. Open attachment downloader
4. Check browser console and debug panel for backend calls

---

## Monitoring & Debugging

### Vercel Logs

- Go to project dashboard → Deployments
- Click on a deployment → Functions
- View real-time logs for each invocation

### Debug Logging

The backend includes `console.log()` statements that appear in Vercel logs:
- Request received
- Download progress
- Errors
- Completion status

---

## Cost Estimation

### Vercel Free Tier (Hobby)
- **100 GB-hours** compute time/month
- **100 GB** bandwidth/month
- **Unlimited** functions

**Estimated usage**:
- Average download: 10 files × 1 MB = 10 MB
- Function execution: ~30 seconds
- **You can handle ~12,000 downloads/month** on free tier

### Paid Plans
If you exceed free tier:
- Pro: $20/month (unlimited)
- Enterprise: Custom pricing

---

## Troubleshooting

### "Backend error: 500"

Check Vercel logs for:
- Trello API errors (invalid token)
- Network timeouts
- Memory limits (large files)

### "Failed to get Trello authentication token"

- Ensure user has authorized the Power-Up
- Check `t.getRestApi().authorize()` was called

### CORS Errors

- Verify `vercel.json` includes CORS headers
- Check backend URL is correct in `getBackendUrl()`

### Timeout Issues (Large Downloads)

Vercel functions have a 10-second timeout on hobby plan. For large batches:
- Upgrade to Pro (60-second timeout)
- Or implement chunked downloads

---

## Security Considerations

1. **Token Security**:
   - Tokens are sent over HTTPS only
   - Tokens are never logged or stored
   - Each user provides their own token

2. **Rate Limiting**:
   - Consider adding rate limiting if needed
   - Vercel includes DDoS protection

3. **API Key**:
   - The Trello API key is public (part of Power-Up)
   - Rate limits are per-token, not per-key

---

## Next Steps

1. **Deploy to Vercel** (5 minutes)
2. **Update `getBackendUrl()`** with your Vercel URL
3. **Test with real Trello board**
4. **Monitor logs** for first few uses
5. **Optional**: Set up custom domain

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Trello API**: https://developer.atlassian.com/cloud/trello/
- **GitHub Issues**: Report bugs in this repo
