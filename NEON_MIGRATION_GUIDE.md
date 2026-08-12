# 🗄️ OurStory — Neon PostgreSQL Migration Guide

> Complete this guide ONE TIME before your first production deploy. Takes ~10 minutes.

---

## Step 1 — Create Your Neon Database (Free)

1. Go to **[neon.tech](https://neon.tech)** → Sign up (GitHub login recommended)
2. Click **"New Project"**
   - **Project name**: `ourstory`
   - **Region**: `Asia Pacific (Singapore) — ap-southeast-1` ← lowest latency for India
   - **PostgreSQL version**: 16 (latest)
3. Click **"Create Project"**

---

## Step 2 — Get Your Connection Strings

After creating the project, Neon shows you the connection details.

1. In the Neon dashboard, go to your project → **"Connection Details"** tab
2. Set the dropdown to **"Prisma"** (it auto-formats the strings for you)
3. Copy **both** strings:

```bash
# Copy this → DATABASE_URL in .env
postgresql://ourstory_owner:PASSWORD@ep-XXXX.ap-southeast-1.aws.neon.tech/ourstory?sslmode=require&pgbouncer=true&connect_timeout=15

# Copy this → DIRECT_URL in .env
postgresql://ourstory_owner:PASSWORD@ep-XXXX.ap-southeast-1.aws.neon.tech/ourstory?sslmode=require
```

---

## Step 3 — Update Your `.env` File

Open `.env` and replace the placeholder values:

```env
DATABASE_URL="<paste pooled URL here>"
DIRECT_URL="<paste direct URL here>"
```

---

## Step 4 — Run the Migration

```bash
# Push the schema to Neon and create all tables
npx prisma migrate dev --name init_postgres

# Seed initial data (themes, test admin user, etc.)
npm run db:seed
```

Expected output:
```
✓ Generated Prisma Client
✓ Running migration `init_postgres`
✓ 8 tables created (User, Event, Media, Payment, Response, Theme, Coupon, WalletTransaction...)
```

---

## Step 5 — Verify It's Working

```bash
# Open Prisma Studio to see your live Neon database in a GUI
npx prisma studio
```

Go to `http://localhost:5555` → you should see all your tables.

---

## Step 6 — Deploy to Vercel

Add the same env variables to Vercel:
1. Vercel Dashboard → Your Project → **Settings → Environment Variables**
2. Add: `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, all Razorpay keys

---

## ⚡ Neon Free Tier Limits

| Resource | Free Tier | Your Needs |
|---|---|---|
| Storage | 512 MB | ~50 MB for thousands of events ✅ |
| Compute | 0.25 CU (auto-suspend) | Fine for early stage ✅ |
| Connections | Up to 100 (pooled) | Plenty for serverless ✅ |
| Branches | 1 branch | Enough ✅ |
| Cost | **$0/month** | 🎉 |

> Upgrade to Neon Pro ($19/month) only when you hit 512 MB storage — that's thousands of users away.

---

## What Changed in the Codebase

| File | Change |
|---|---|
| `prisma/schema.prisma` | `provider = "postgresql"`, added `directUrl`, `@db.Text` on large fields, referral + wallet schema |
| `.env` | Template URLs for Neon (replace placeholders with your actual values) |
| No app code changes | Prisma handles the rest — your queries work identically |
