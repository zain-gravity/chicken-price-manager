# 🐔 Chicken Price Manager

A simple, fast web app for chicken shop owners to manage daily prices and share them with customers on WhatsApp.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4) ![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)

## ✨ Features

- **Daily Price Management** — Add, edit, delete, and reorder chicken items with prices
- **Auto-Save** — Prices are saved automatically as you type
- **History** — View and reuse previous days' price lists
- **PDF Export** — Generate professional A4 PDF price lists
- **Image Export** — Generate shareable images (1080px wide) with light/dark themes
- **WhatsApp Sharing** — Share PDF/image directly via the native share sheet
- **Multi-User** — Secure login with isolated data per shop owner
- **Mobile-First** — Optimized for budget Android phones
- **PWA** — Install on home screen for app-like experience

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- A [MongoDB Atlas](https://cloud.mongodb.com/) account (free tier works)
- A [Vercel](https://vercel.com/) account (for deployment)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/chicken-price-manager.git
cd chicken-price-manager
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/) and sign up (free)
2. Click **"Build a Database"** → Choose **M0 Free** tier
3. Choose a cloud provider and region (any is fine)
4. Create a **Database User**:
   - Username: `chickenapp`
   - Password: (generate a strong one, save it)
5. Under **Network Access**, click **"Add IP Address"** → **"Allow Access from Anywhere"** (for Vercel)
6. Go to **Database** → **Connect** → **"Connect your application"** → **Node.js**
7. Copy the connection string. It looks like:
   ```
   mongodb+srv://chickenapp:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
8. Replace `<password>` with your actual password and add the database name:
   ```
   mongodb+srv://chickenapp:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/chicken-price-manager?retryWrites=true&w=majority
   ```

### 4. Configure Environment Variables

Copy the example env file:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
MONGODB_URI=mongodb+srv://chickenapp:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/chicken-price-manager?retryWrites=true&w=majority
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000
```

Generate a secret:
```bash
openssl rand -base64 32
```
Or visit: https://generate-secret.vercel.app/32

### 5. Run in Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 User Guide

### For the Shop Owner

#### Getting Started
1. Open the app in your phone's browser
2. Tap **"Sign Up"** and create an account with your email
3. Enter your shop name (e.g., "Khan's Chicken Corner")
4. You're ready to go!

#### Daily Usage (2 minutes)
1. **Open the app** → You'll see today's price entry screen
2. **Update prices** → Tap on any price field and type the new price
3. **Add new items** → Tap "+ Add Item" and fill in the name and price
4. **Remove items** → Tap the 🗑️ icon next to any item
5. **Reorder** → Use ▲ ▼ arrows to move items up or down
6. **Preview** → Tap the big red **"Preview & Export"** button
7. **Share** → Tap **"Share PDF"** or **"Share Image"** → Choose WhatsApp → Pick your group

#### Tips
- Prices **auto-save** as you type — no save button needed!
- Use **"Copy from Last Day"** to quickly start with yesterday's prices
- Check **History** to see or reuse any previous day's list
- In **Settings**, customize your shop name, currency, footer text, and image theme

## 🌐 Deploy to Vercel

### Step-by-Step

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Chicken Price Manager"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/chicken-price-manager.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com/) and sign in with GitHub
   - Click **"New Project"**
   - Import your `chicken-price-manager` repository
   - Framework preset: **Next.js** (auto-detected)

3. **Set Environment Variables in Vercel:**
   - In the project settings, go to **"Environment Variables"**
   - Add these:
     | Name | Value |
     |------|-------|
     | `MONGODB_URI` | Your MongoDB Atlas connection string |
     | `NEXTAUTH_SECRET` | Your random secret key |
     | `NEXTAUTH_URL` | `https://your-app.vercel.app` (your Vercel URL) |

4. **Deploy:**
   - Click **"Deploy"**
   - Wait for the build to complete
   - Your app is live! 🎉

5. **Update `NEXTAUTH_URL`:**
   - After first deploy, copy your Vercel URL (e.g., `https://chicken-price-xyz.vercel.app`)
   - Go to Vercel project settings → Environment Variables
   - Update `NEXTAUTH_URL` to your actual Vercel URL
   - Redeploy

## 🏗️ Project Structure

```
chicken-price-manager/
├── .env.example              # Environment variable template
├── package.json              # Dependencies
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS theme
├── public/
│   └── manifest.json         # PWA manifest
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout (fonts, providers)
│   │   ├── page.tsx          # Home redirect
│   │   ├── globals.css       # Global styles
│   │   ├── (auth)/
│   │   │   ├── layout.tsx    # Auth page layout
│   │   │   ├── login/        # Login page
│   │   │   └── signup/       # Signup page
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx    # Dashboard layout (header + nav)
│   │   │   ├── dashboard/    # Price entry (main screen)
│   │   │   ├── history/      # Price history
│   │   │   ├── preview/      # Preview & export
│   │   │   └── settings/     # User settings
│   │   └── api/
│   │       ├── auth/         # NextAuth + signup
│   │       ├── price-lists/  # Price list CRUD
│   │       └── settings/     # User settings API
│   ├── components/
│   │   └── SessionWrapper.tsx
│   ├── lib/
│   │   ├── db.ts             # MongoDB connection
│   │   ├── auth.ts           # NextAuth config
│   │   ├── share.ts          # Web Share API utility
│   │   └── export/
│   │       ├── pdf-generator.ts
│   │       └── image-generator.ts
│   ├── models/
│   │   ├── User.ts           # User model (Mongoose)
│   │   └── PriceList.ts      # PriceList model (Mongoose)
│   └── types/
│       └── index.ts          # TypeScript types
```

## 🔒 Security

- Passwords are hashed with **bcrypt** (12 rounds)
- Authentication via **NextAuth.js** with JWT sessions
- All API routes check for authenticated session
- User data is isolated by `userId`
- No plain-text passwords stored
- HTTP-only secure cookies for sessions

## 📄 License

MIT License. Built with ❤️ for chicken shop owners everywhere.
