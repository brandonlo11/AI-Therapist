# Deployment Guide for Vercel

This guide will help you deploy the AI Relationship Coach application to Vercel.

## 🎯 Key Feature: User API Keys

**Users can now enter their own Gemini API keys!** This means:
- ✅ No server-side API key required for deployment
- ✅ Each user uses their own API key (stored locally in their browser)
- ✅ More secure and scalable
- ✅ Perfect for public deployments

## Prerequisites

1. **GitHub Account** (for version control)
2. **Vercel Account** ([Sign up free](https://vercel.com))
3. ~~**Google Gemini API Key**~~ - **Not needed!** Users enter their own keys

## Quick Deploy to Vercel

### Step 1: Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Deploy to Vercel

1. **Go to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Sign up or login with your GitHub account

2. **Create New Project:**
   - Click "New Project"
   - Select "Import Git Repository"
   - Choose your GitHub repository

3. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

4. **Environment Variables:**
   - **No environment variables needed!**
   - Users will enter their own API keys in the app settings

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes for the build to complete
   - Your site will be live automatically!

### Step 3: Your Site is Live! 🎉

- Vercel will provide you with a URL like: `your-app.vercel.app`
- You can customize the domain in Vercel project settings
- Every push to your main branch will trigger automatic deployments

## Post-Deployment

### For Users (First Time):

1. Visit your deployed site
2. Click the settings icon (✏️) in the header
3. Enter their Gemini API key (get one free at [Google AI Studio](https://makersuite.google.com/app/apikey))
4. The key is saved locally in their browser
5. Start chatting!

### Testing Your Deployment:

- ✅ Send a test message
- ✅ Verify chat history persists (localStorage)
- ✅ Test context settings
- ✅ Test avatar upload
- ✅ Create multiple chats and switch between them

## Custom Domain (Optional)

1. Go to your Vercel project dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Wait for SSL certificate (automatic)

## Continuous Deployment

Vercel automatically deploys:
- ✅ Every push to the main branch (production)
- ✅ Every pull request (preview deployments)
- ✅ All deployments are instant and include:
  - Automatic HTTPS
  - Global CDN
  - Analytics (optional)

## Troubleshooting

### Build Fails
- Check Node.js version (needs 18+)
- Run `npm install` locally to verify dependencies
- Check for TypeScript errors: `npm run lint`

### API Errors After Deployment
- Verify users are entering their API keys in settings
- Check browser console for errors
- Ensure the API route is working: `/api/chat`

### 404 Errors
- Verify Next.js routing is working
- Check that API routes are in `app/api/` directory
- Ensure build completed successfully

## Advantages of Vercel

✅ **Zero Configuration** - Works out of the box  
✅ **Fast Deployments** - 2-3 minute build times  
✅ **Automatic HTTPS** - SSL certificates included  
✅ **Global CDN** - Fast worldwide performance  
✅ **Preview Deployments** - Test PRs before merging  
✅ **Free Tier** - Generous free tier for personal projects  
✅ **Next.js Optimized** - Built by the Next.js creators  

## Support

If you encounter issues:
1. Check the deployment logs in Vercel dashboard
2. Verify your code builds locally: `npm run build`
3. Check Vercel's deployment logs for errors
4. Visit [Vercel Documentation](https://vercel.com/docs)
