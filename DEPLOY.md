# Deployment Guide

Your app is built with **Vite**, which makes it very easy to deploy.

## Option 1: Vercel (Recommended)
Vercel is the creators of Next.js and provides the smoothest experience for Vite apps.

1.  **Push to GitHub**:
    -   Create a new repository on [GitHub](https://github.com/new).
    -   Run the commands shown on GitHub to push your existing code:
        ```bash
        git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
        git branch -M main
        git push -u origin main
        ```

2.  **Deploy on Vercel**:
    -   Go to [vercel.com](https://vercel.com) and sign up/login.
    -   Click **"Add New..."** -> **"Project"**.
    -   Import your GitHub repository.
    -   Vercel will detect "Vite" automatically.
    -   Click **Deploy**.

## Option 2: Netlify
Similar to Vercel, very easy to use.

1.  Push to GitHub (same as above).
2.  Go to [netlify.com](https://netlify.com).
3.  "Add new site" -> "Import from an existing project".
4.  Connect GitHub and select your repo.
5.  Click **Deploy**.

## Important Note on Environment Variables
Since your Cloudinary keys are currently hardcoded in `src/utils/upload.js`, you don't *need* to set environment variables on Vercel/Netlify for this to work. However, for better security in the future, you might want to move them to `.env` files. For now, it will work as-is.
