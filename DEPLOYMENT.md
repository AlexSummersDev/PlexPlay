# Web Deployment Guide

This guide explains how to deploy your Media Streaming App as a web application using GitHub Pages.

## Prerequisites

- A GitHub account
- Git installed on your computer
- Your code pushed to a GitHub repository

## Deployment Options

### Option 1: GitHub Pages (Recommended)

GitHub Pages provides free hosting for static websites directly from your GitHub repository.

#### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings**
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select **GitHub Actions**

#### Step 2: Configure Secrets (Optional)

If you want to use API keys in production:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the following secrets:
   - `TMDB_API_KEY` - Your TMDB API key
   - `OPENAI_API_KEY` - Your OpenAI API key (optional)
   - `ANTHROPIC_API_KEY` - Your Anthropic API key (optional)
   - `GROK_API_KEY` - Your Grok API key (optional)

#### Step 3: Deploy

The app will automatically deploy when you push to the `main` branch:

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

After a few minutes, your app will be live at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

#### Manual Deployment

You can also trigger deployment manually:

1. Go to **Actions** tab in your repository
2. Click on **Deploy to GitHub Pages** workflow
3. Click **Run workflow**

### Option 2: Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Build the web app:
```bash
bun run build:web
```

3. Deploy:
```bash
cd dist
vercel --prod
```

### Option 3: Netlify

1. Install Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Build the web app:
```bash
bun run build:web
```

3. Deploy:
```bash
netlify deploy --prod --dir=dist
```

### Option 4: Custom Server

1. Build the web app:
```bash
bun run build:web
```

2. Upload the `dist` folder to your web server

3. Configure your server to serve the `index.html` file for all routes

## Local Testing

Test the web build locally before deploying:

```bash
# Start development server
bun run web

# Or build and serve
bun run build:web
npx serve dist
```

## Environment Variables

The app uses environment variables for API keys. You can configure them:

1. **For local development**: Add to `.env` file
2. **For GitHub Pages**: Add as repository secrets
3. **For Vercel/Netlify**: Add in their dashboard under Environment Variables

## Custom Domain

### GitHub Pages

1. Go to **Settings** → **Pages**
2. Under **Custom domain**, enter your domain
3. Add a CNAME record in your DNS provider pointing to:
   ```
   YOUR_USERNAME.github.io
   ```

### Vercel/Netlify

Follow their respective documentation for custom domains.

## Troubleshooting

### Build Fails

- Check that all dependencies are installed: `bun install`
- Verify TypeScript has no errors: `npx tsc --noEmit`
- Check the GitHub Actions logs for specific errors

### App Not Loading

- Clear browser cache
- Check browser console for errors
- Verify the base path is correct in deployment

### Features Not Working

Some features may have limitations on web:
- Camera/media access requires HTTPS
- File system access works differently
- Some native modules may need web alternatives

## Web-Specific Considerations

### Responsive Design

The app is designed for mobile but works on desktop. Consider:
- Setting max-width for better desktop experience
- Adjusting touch targets for mouse users

### Performance

- Images are cached by the browser
- API calls are the same as mobile
- Consider adding service worker for offline support

### Browser Compatibility

The app works on modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Updating the App

To update your deployed app:

```bash
git add .
git commit -m "Update app"
git push origin main
```

GitHub Actions will automatically rebuild and redeploy.

## Support

For issues with deployment:
- Check [Expo Web docs](https://docs.expo.dev/workflow/web/)
- Review [GitHub Pages docs](https://docs.github.com/en/pages)
- Check the Actions logs for build errors
