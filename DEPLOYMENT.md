# EzChat - Deployment & Hosting Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Deploying to Vercel](#deploying-to-vercel)
3. [Setting Up Convex Production](#setting-up-convex-production)
4. [Configuring Production Authentication](#configuring-production-authentication)
5. [Using Namecheap Domain](#using-namecheap-domain)
6. [Environment Variables](#environment-variables)
7. [Post-Deployment Setup](#post-deployment-setup)
8. [Monitoring & Scaling](#monitoring--scaling)

---

## Overview

### Why Vercel + Namecheap?

**Vercel** is the recommended hosting platform because:
- ✅ Built by the creators of Next.js
- ✅ Zero-config deployment
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Free tier is generous
- ✅ Perfect for Next.js apps

**Namecheap** is used for:
- 🌐 Purchasing your custom domain (e.g., `ezchat.com`)
- 📧 Email hosting (optional)

**Important:** Namecheap's shared hosting does NOT support Next.js apps. You'll host on Vercel and point your Namecheap domain to it.

---

## Deploying to Vercel

### 1. Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"** (recommended)
4. Authorize Vercel to access your repositories

### 2. Push Your Code to GitHub

If you haven't already:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Create GitHub repository at github.com and then:
git remote add origin https://github.com/yourusername/ezchat.git
git branch -M main
git push -u origin main
```

### 3. Import Project to Vercel

1. In Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Select **"Import Git Repository"**
3. Find your **ezchat** repository and click **"Import"**
4. Configure project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (leave default)
   - **Build Command:** `npm run build` (auto-filled)
   - **Output Directory:** `.next` (auto-filled)

### 4. Add Environment Variables

Click **"Environment Variables"** and add these:

```env
CONVEX_DEPLOYMENT=prod:your-prod-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-prod.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-prod.convex.site
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
```

**Note:** We'll get the Convex production URLs in the next section.

### 5. Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://ezchat-abc123.vercel.app`

**Don't worry if the app doesn't work yet** - we still need to set up production Convex and Clerk.

---

## Setting Up Convex Production

### 1. Create Production Deployment

In your local project:

```bash
npx convex deploy --cmd 'npm run build'
```

This will:
- Ask if you want to create a production deployment (say **yes**)
- Deploy all your Convex functions to production
- Output your production URLs

### 2. Get Production URLs

After deployment completes, run:

```bash
npx convex env get NEXT_PUBLIC_CONVEX_URL --prod
npx convex env get CONVEX_DEPLOYMENT --prod
```

Copy these values.

### 3. Update Vercel Environment Variables

1. Go to Vercel Dashboard
2. Select your project → **Settings** → **Environment Variables**
3. Edit these variables and set them to **production** values:

```env
CONVEX_DEPLOYMENT=prod:your-deployment-xxx
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-xxx.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-deployment-xxx.convex.site
```

4. Click **"Save"**

### 4. Redeploy

Go to **Deployments** tab and click **"Redeploy"** on the latest build.

---

## Configuring Production Authentication

### 1. Switch Clerk to Production Mode

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. In the top-left, you'll see **"Development"** - click to switch
4. Click **"Go to production"**
5. Follow prompts to publish to production

### 2. Get Production API Keys

1. Go to **API Keys** in Clerk Dashboard
2. Switch to **"Production"** tab
3. Copy these values:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

### 3. Update Production JWT Template

1. Go to **Configure** → **JWT Templates**
2. Switch to **Production** mode
3. Create a new **"convex"** template (same as dev)
4. Add claims:

```json
{
  "aud": "convex"
}
```

5. Copy the **Issuer URL**

### 4. Update Convex Auth Config

Edit `convex/auth.config.ts`:

```typescript
export default {
  providers: [
    {
      domain: "https://your-production-app.clerk.accounts.dev", // Update this
      applicationID: "convex",
    },
  ]
};
```

Then deploy to production:

```bash
npx convex deploy
```

### 5. Update Environment Variables in Vercel

Add the production Clerk keys to Vercel:

1. Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Update:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

3. **Redeploy** the project

### 6. Configure Clerk Webhooks

1. In Clerk Dashboard (Production mode), go to **Webhooks**
2. Click **"+ Add endpoint"**
3. Enter your webhook URL:
   ```
   https://your-deployment.vercel.app/api/webhooks/clerk
   ```
4. Subscribe to events:
   - `user.created`
   - `user.updated`
5. Copy the **Signing Secret**
6. Add to Vercel Environment Variables:
   ```env
   CLERK_WEBHOOK_SECRET=whsec_...
   ```
7. Redeploy

---

## Using Namecheap Domain

### Step 1: Purchase Domain on Namecheap

1. Go to [namecheap.com](https://www.namecheap.com)
2. Search for your desired domain (e.g., `ezchat.cam`)
3. Purchase the domain
4. Complete checkout

### Step 2: Add Domain to Vercel

1. In Vercel Dashboard, go to your project
2. Click **Settings** → **Domains**
3. Click **"Add"**
4. Enter your domain: `ezchat.cam`
5. Click **"Add"**

Vercel will show you DNS records to configure.

### Step 3: Configure Namecheap DNS

**Option A: Use Vercel Nameservers (Recommended)**

1. In Vercel, you'll see custom nameservers like:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
2. Go to Namecheap Dashboard
3. Find your domain → **Manage**
4. Under **Nameservers**, select **"Custom DNS"**
5. Enter Vercel's nameservers:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
6. Click **"Save"**

**Option B: Use Namecheap DNS with A/CNAME Records**

If you want to keep Namecheap DNS (for email, etc.):

1. In Namecheap, go to **Domain List** → **Manage** → **Advanced DNS**
2. Add these records:

   **For root domain (ezchat.cam):**
   ```
   Type: A Record
   Host: @
   Value: 76.76.21.21
   TTL: Automatic
   ```

   **For www subdomain:**
   ```
   Type: CNAME Record
   Host: www
   Value: cname.vercel-dns.com
   TTL: Automatic
   ```

3. Remove any conflicting records (old A, CNAME, etc.)
4. Click **"Save All Changes"**

### Step 4: Verify Domain

1. Back in Vercel, click **"Verify"** next to your domain
2. DNS propagation can take 1-48 hours (usually < 30 minutes)
3. Once verified, you'll see a green checkmark ✅

### Step 5: Configure www Redirect (Optional)

In Vercel:
1. Add both `ezchat.cam` and `www.ezchat.cam` as domains
2. Set `ezchat.cam` as primary
3. Vercel will auto-redirect `www` to non-www (or vice versa)

### Step 6: Update Clerk Authorized Domains

1. Go to Clerk Dashboard → **Domains**
2. Add your production domains:
   ```
   ezchat.cam
   www.ezchat.cam
   ```
3. This allows authentication to work on your custom domain

---

## Environment Variables

### Complete Production `.env` Reference

**Never commit these to Git!** Only add them to Vercel Dashboard.

```env
# === CONVEX (Production) ===
CONVEX_DEPLOYMENT=prod:your-deployment-123
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-123.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-deployment-123.convex.site

# === CLERK (Production) ===
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_cl...abc123
CLERK_SECRET_KEY=sk_live_cl...xyz789
CLERK_WEBHOOK_SECRET=whsec_abc123xyz789

# === POLAR.SH (Optional - for billing) ===
POLAR_API_KEY=polar_...
NEXT_PUBLIC_POLAR_ORGANIZATION_ID=org_...

# === OPTIONAL ===
# NODE_ENV=production (Vercel sets this automatically)
```

### How to Add/Update Variables in Vercel

1. Vercel Dashboard → Project → **Settings** → **Environment Variables**
2. Click **"Add New"**
3. Enter **Key** and **Value**
4. Select environment: **Production**, **Preview**, or **Development**
5. Click **"Save"**
6. **Redeploy** the project for changes to take effect

---

## Post-Deployment Setup

### 1. Test Your Production Site

Visit your deployed URL (or custom domain) and test:

- ✅ Homepage loads
- ✅ Sign in/Sign up works
- ✅ Can claim a username
- ✅ Can create a chatroom
- ✅ Can join other chatrooms
- ✅ Camera access works (HTTPS required!)
- ✅ Text chat works
- ✅ User list updates in real-time

### 2. Enable Production Clerk Features

In Clerk Dashboard (Production):

1. **Multi-factor Authentication (MFA):**
   - Go to **User & Authentication** → **Multi-factor**
   - Enable SMS or Authenticator app

2. **Bot Protection:**
   - Go to **User & Authentication** → **Attack Protection**
   - Enable CAPTCHA for sign-ups

3. **Session Management:**
   - Configure session length
   - Set up session activity timeout

### 3. Monitor Performance

**Vercel Analytics:**
1. Go to your project → **Analytics** tab
2. View:
   - Page views
   - Top pages
   - Visitor demographics
   - Performance metrics

**Convex Logs:**
1. Visit [dashboard.convex.dev](https://dashboard.convex.dev)
2. Select your production deployment
3. Go to **Logs** to see:
   - Function calls
   - Query performance
   - Database mutations
   - Errors

### 4. Set Up Error Monitoring (Optional)

Install Sentry for error tracking:

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Add to Vercel Environment Variables:
```env
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

---

## Scaling & Performance

### Vercel Limits (Free Tier)

- **Bandwidth:** 100GB/month
- **Build Minutes:** 6,000 minutes/month
- **Serverless Function Execution:** 100GB-hours
- **Concurrent Builds:** 1

**Pro Tier ($20/month):**
- Unlimited bandwidth
- Custom domains unlimited
- Analytics included
- Priority support

### Convex Limits

**Free Tier:**
- 1GB database storage
- 50M function calls/month
- Unlimited edge caching

**Pro Tier ($25/month+):**
- 10GB+ storage
- Unlimited function calls
- Advanced features

### Optimization Tips

1. **Enable Vercel Image Optimization:**
   - Use `next/image` instead of `<img>` tags
   - Automatic WebP conversion
   - Lazy loading built-in

2. **Add Caching Headers:**
   Edit `next.config.js`:
   ```javascript
   async headers() {
     return [
       {
         source: '/static/:path*',
         headers: [
           { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
         ]
       }
     ]
   }
   ```

3. **Use Convex Pagination:**
   For large chatroom lists, paginate results:
   ```typescript
   // In convex/chatrooms.ts
   export const getAllChatrooms = query({
     args: { paginationOpts: paginationOptsValidator },
     handler: async (ctx, args) => {
       return await ctx.db
         .query("chatrooms")
         .paginate(args.paginationOpts);
     },
   });
   ```

---

## Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you:
1. Push to `main` branch → **Production** deployment
2. Push to feature branches → **Preview** deployment
3. Open pull requests → **Preview** deployment

### Manual Deployments

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel
```

### Branch-Specific Environments

Edit `vercel.json`:

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "staging": true
    }
  },
  "env": {
    "ENVIRONMENT": "production"
  },
  "preview": {
    "env": {
      "ENVIRONMENT": "preview"
    }
  }
}
```

---

## Backup & Disaster Recovery

### Convex Backups

1. Go to Convex Dashboard → **Snapshots**
2. Snapshots are automatic (every 24 hours on Pro plan)
3. Can restore with one click

### Manual Database Export

```bash
npx convex export --deployment prod:your-deployment-123
```

Exports all tables to JSON files.

### Code Backups

Your code is on GitHub - always backed up!

For extra safety:
```bash
git push --mirror https://backup-repo-url.git
```

---

## Security Checklist

Before going live:

- [ ] All environment variables in Vercel, not in code
- [ ] Clerk production mode enabled
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Clerk webhook secret configured
- [ ] Content Security Policy headers set
- [ ] Rate limiting enabled on API routes
- [ ] User input sanitized (XSS protection)
- [ ] CORS configured properly
- [ ] Secrets rotated after public deployment
- [ ] Error messages don't leak sensitive info

---

## Custom Email Setup (Namecheap)

If you want `contact@ezchat.cam` email:

1. In Namecheap Dashboard, select your domain
2. Go to **Email** → **Email Hosting**
3. Choose a plan (starts at $1.58/month)
4. Set up email accounts
5. Configure MX records (automatic)
6. Use webmail or connect to Gmail/Outlook

---

## Troubleshooting

### ❌ Domain Not Working After 48 Hours

1. Check DNS propagation: https://dnschecker.org
2. Verify Vercel shows domain as verified
3. Try clearing DNS cache:
   ```bash
   # Windows
   ipconfig /flushdns
   
   # Mac
   sudo dscacheutil -flushcache
   ```

### ❌ "Invalid SSL Certificate"

Wait 24 hours - Vercel provisions SSL automatically.

If still broken:
1. Vercel → Domains → Remove domain
2. Wait 5 minutes
3. Re-add domain

### ❌ Authentication Not Working in Production

1. Check Clerk authorized domains include your production URL
2. Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is the **production** key
3. Ensure JWT template exists in **production** Clerk

### ❌ Serverless Function Timeout

Vercel has 10-second timeout on Hobby plan.

Solution:
1. Optimize slow functions
2. Move to Edge Functions (near-instant)
3. Upgrade to Pro ($20/mo) for 60-second timeout

---

## Costs Summary

### Free Tier (Good for MVP/Testing)
- **Vercel:** Free forever
- **Convex:** Free (up to 1GB storage)
- **Clerk:** Free (up to 10,000 MAU)
- **Namecheap Domain:** ~$10-15/year
- **Total:** ~$1-2/month

### Production Tier (Recommended)
- **Vercel Pro:** $20/month
- **Convex Pro:** $25/month
- **Clerk Pro:** $25/month (up to 10k MAU, then $0.02/user)
- **Namecheap Domain:** ~$10-15/year
- **Total:** ~$70-75/month

---

## Next Steps

1. **Launch Checklist:**
   - [ ] Test all features in production
   - [ ] Set up monitoring (Sentry/Vercel Analytics)
   - [ ] Configure billing (Polar.sh)
   - [ ] Create privacy policy & terms
   - [ ] Set up customer support (Discord/Email)

2. **Marketing:**
   - [ ] Social media accounts
   - [ ] Create demo video
   - [ ] Submit to Product Hunt
   - [ ] Post on Reddit/HackerNews

3. **Scaling:**
   - [ ] Monitor usage metrics
   - [ ] Upgrade plans as needed
   - [ ] Enable CDN for static assets
   - [ ] Consider multi-region deployments

---

## Support

**Platform-Specific Help:**
- Vercel: https://vercel.com/support
- Convex: https://convex.dev/community
- Clerk: https://clerk.com/support
- Namecheap: https://www.namecheap.com/support/

**Documentation:**
- Vercel Docs: https://vercel.com/docs
- Convex Docs: https://docs.convex.dev
- Clerk Docs: https://clerk.com/docs

---

**Last Updated:** February 13, 2026

**Deployment Checklist:** Ready to deploy? Run through [SETUP.md](./SETUP.md) first, then follow this guide step-by-step.
