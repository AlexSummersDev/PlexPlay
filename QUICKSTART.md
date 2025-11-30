# Quick Start: Deploy to GitHub Pages

Follow these simple steps to deploy your app as a website:

## 1. Push to GitHub

If you haven't already, push your code to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ready for web deployment"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

## 2. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top right)
3. Scroll down and click **Pages** in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. Click **Save**

That's it! Your app is now set up for deployment.

## 3. Deploy

Every time you push to the `main` branch, your app will automatically build and deploy:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Wait 2-3 minutes for the build to complete.

## 4. View Your App

Your app will be live at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

Example: If your username is `johndoe` and repo is `media-app`:
```
https://johndoe.github.io/media-app/
```

## Checking Deployment Status

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. You'll see the deployment workflow running
4. Green checkmark = Successfully deployed!
5. Red X = Something went wrong (click to see logs)

## Common Issues

### "Repository not found" error
- Make sure the repository exists on GitHub
- Check that you used the correct repository URL

### Deployment fails
- Check the Actions tab for error logs
- Verify all dependencies are in package.json
- Make sure TypeScript has no errors locally

### App shows 404
- Wait a few minutes after first deployment
- Check that GitHub Pages is enabled in Settings
- Verify the source is set to "GitHub Actions"

## Optional: Add API Keys

If you want to use TMDB or other APIs in production:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add:
   - Name: `TMDB_API_KEY`
   - Value: Your actual API key
4. Repeat for other APIs if needed

## Need More Help?

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions and advanced options.
