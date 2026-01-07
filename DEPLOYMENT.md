# Vercel Deployment Guide

## Prerequisites
- GitHub account with your repository pushed
- Vercel account (free tier works)

## Step-by-Step Deployment

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**
   - Visit https://vercel.com
   - Sign up/Login with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `crowdfunding-dapp`
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `frontend-app` (IMPORTANT!)
   - **Build Command:** `npm run build` (runs in frontend-app)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install`

4. **Environment Variables**
   Add these in Vercel dashboard:
   ```
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xAff0367646b6cCC707057e4e32d83daF8C0c0772
   ```
   (Use your Sepolia contract address)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live!

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd frontend-app
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS
   # Enter: 0xAff0367646b6cCC707057e4e32d83daF8C0c0772
   ```

5. **Redeploy**
   ```bash
   vercel --prod
   ```

## Important Configuration

### Root Directory Setup
Since your Next.js app is in `frontend-app/`, you need to configure Vercel:

**Option A: In Vercel Dashboard**
- Go to Project Settings → General
- Set "Root Directory" to `frontend-app`

**Option B: Using vercel.json** (already created)
- The `vercel.json` file in root handles this automatically

### Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

- `NEXT_PUBLIC_CONTRACT_ADDRESS` - Your deployed contract address
  - For Sepolia: `0xAff0367646b6cCC707057e4e32d83daF8C0c0772`
  - For localhost: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

### Build Settings

Vercel should auto-detect Next.js, but verify:
- **Framework:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

## Post-Deployment

1. **Test Your Deployment**
   - Visit your Vercel URL
   - Connect MetaMask (Sepolia network)
   - Test creating campaigns, donating, etc.

2. **Custom Domain (Optional)**
   - Go to Project Settings → Domains
   - Add your custom domain

3. **Monitor Deployments**
   - Check Vercel dashboard for build logs
   - Monitor function logs for errors

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compiles: `npm run build`

### Environment Variables Not Working
- Ensure variable name starts with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding variables
- Check browser console for errors

### Wrong Contract Address
- Update `NEXT_PUBLIC_CONTRACT_ADDRESS` in Vercel
- Redeploy the project

## Production Checklist

- [ ] Environment variables set in Vercel
- [ ] Root directory configured (`frontend-app`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Tested on Vercel preview deployment
- [ ] MetaMask connects correctly
- [ ] Contract interactions work
- [ ] Mobile responsive design works

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
