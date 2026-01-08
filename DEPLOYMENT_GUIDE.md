# Deployment Guide - Excel to Cards Importer

This guide will walk you through deploying your Trello Power-Up to make it available for use.

## 🚀 Quick Deployment Options

### Option 1: GitHub Pages (Recommended - Free & Easy)

1. **Create GitHub Repository**:
   ```bash
   # Create a new repository on GitHub
   # Clone it locally
   git clone https://github.com/yourusername/trello-excel-powerup.git
   cd trello-excel-powerup
   ```

2. **Copy Files**:
   ```bash
   # Copy all the Power-Up files to your repository
   cp -r /mnt/okcomputer/output/trello-excel-powerup/* .
   ```

3. **Commit and Push**:
   ```bash
   git add .
   git commit -m "Initial Trello Power-Up deployment"
   git push origin main
   ```

4. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from branch
   - Branch: main, folder: / (root)
   - Save
   - Your URL will be: `https://yourusername.github.io/trello-excel-powerup/`

### Option 2: Netlify (Free Tier Available)

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   cd /mnt/okcomputer/output/trello-excel-powerup
   netlify deploy --prod --dir=.
   ```

3. **Get Your URL**: Netlify will provide a URL like `https://amazing-name-123456.netlify.app`

### Option 3: Vercel (Free Tier Available)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd /mnt/okcomputer/output/trello-excel-powerup
   vercel --prod
   ```

### Option 4: Traditional Web Hosting

Upload all files to any web hosting service that supports static files:
- cPanel hosting
- AWS S3 + CloudFront
- Azure Static Web Apps
- Google Cloud Storage
- Any shared hosting provider

## 🔧 Trello Power-Up Configuration

### Step 1: Create Power-Up in Trello

1. Visit [Trello Power-Up Admin Portal](https://trello.com/power-ups/admin)
2. Click "New" button
3. Fill in the details:
   - **Name**: "Excel to Cards Importer"
   - **Short Description**: "Import Excel data into Trello cards"
   - **Author**: Your name or organization
   - **Support Email**: Your email

### Step 2: Configure Connector URL

1. After creating the Power-Up, go to its settings
2. Set the **Connector URL** to your deployed URL + `/html/main.html`
   - Example: `https://yourusername.github.io/trello-excel-powerup/html/main.html`
3. Save the configuration

### Step 3: Generate API Key

1. In your Power-Up admin panel, go to "API Key" tab
2. Click "Generate a new API Key"
3. Copy the generated key

### Step 4: Update Power-Up Code

1. In `js/powerup.js` and `js/main.js`, replace `YOUR_TRELLO_APP_KEY` with your actual API key:
   ```javascript
   appKey: 'your-actual-api-key-here'
   ```

2. Commit and redeploy your changes

### Step 5: Configure Capabilities

1. In Power-Up admin, go to "Capabilities" tab
2. Enable the following capabilities:
   - `board-buttons`
   - `callback`
   - `card-buttons`
3. Save configuration

### Step 6: Test Your Power-Up

1. Go to any Trello board
2. Click "Power-Ups" → "Add Power-Ups"
3. Click "Create custom Power-Up"
4. Enter your Power-Up URL (the connector URL from step 2)
5. Add the Power-Up to your board
6. Test the functionality

## 🌐 Custom Domain Setup (Optional)

If you want to use a custom domain:

### GitHub Pages Custom Domain

1. Add a `CNAME` file to your repository:
   ```bash
   echo "powerup.yourdomain.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push
   ```

2. Configure DNS:
   - Add CNAME record pointing to `yourusername.github.io`
   - Or use A records for apex domain pointing to GitHub Pages IPs

### Other Hosting Providers

Follow your hosting provider's documentation for custom domain setup:
- Netlify: Domain management in site settings
- Vercel: Domains section in dashboard
- AWS: Route 53 configuration
- cPanel: Addon domains or subdomains

## 🔐 Security Considerations

### HTTPS Required

Trello requires all Power-Up URLs to use HTTPS. Most modern hosting providers include SSL certificates automatically.

### CORS Configuration

Ensure your hosting provider allows cross-origin requests from Trello's domains:
- `https://trello.com`
- `https://*.trello.com`

### API Key Security

- The API key is public and safe to include in client-side code
- Never include API tokens or secrets in client-side code
- The Power-Up uses Trello's secure OAuth flow for authentication

## 📊 Monitoring & Analytics

### Basic Analytics

Add Google Analytics or similar to track usage:

1. **Add to `html/main.html`**:
   ```html
   <!-- Google Analytics -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'GA_MEASUREMENT_ID');
   </script>
   ```

### Error Tracking

Consider adding error tracking:
- Sentry (free tier available)
- Rollbar
- LogRocket

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
```

### Automated Testing

Add basic tests to ensure your Power-Up works:

```javascript
// test/basic.test.js
const { expect } = require('@playwright/test');

test('Power-Up loads correctly', async ({ page }) => {
  await page.goto('http://localhost:3000/html/main.html');
  await expect(page.locator('h1')).toContainText('Excel to Cards Importer');
});
```

## 🚨 Troubleshooting Deployment

### Common Issues

**1. Power-Up Not Loading**
- Check browser console for errors
- Verify HTTPS is enabled
- Ensure all files are uploaded correctly
- Check CORS settings

**2. API Errors**
- Verify API key is correct
- Check that API key is added to both JS files
- Ensure Power-Up is properly registered in Trello

**3. File Not Found Errors**
- Check file paths in HTML/JS
- Verify all files are uploaded
- Use browser dev tools to check network requests

**4. Styling Issues**
- Ensure CSS file is loading
- Check for mixed content warnings
- Verify all assets (icons) are accessible

### Debug Checklist

1. **Test Direct Access**:
   - Visit your connector URL directly in browser
   - Should show the Power-Up interface

2. **Check Browser Console**:
   - Look for JavaScript errors
   - Check for network request failures

3. **Verify Trello Integration**:
   - Check Power-Up admin for errors
   - Ensure capabilities are configured correctly

4. **Test on Different Boards**:
   - Try on multiple Trello boards
   - Test with different user accounts

## 📞 Support & Maintenance

### Updates

When updating your Power-Up:
1. Update code locally
2. Test thoroughly
3. Commit and push changes
4. Deploy to hosting provider
5. Clear browser cache for users

### Monitoring

Regularly check:
- Error logs
- User feedback
- Trello API changes
- Browser compatibility

### Backup

Keep backups of:
- Source code (GitHub/GitLab)
- Configuration files
- API keys and settings
- Documentation

## 🎉 Success Checklist

After deployment, verify:

- [ ] Power-Up loads in Trello modal
- [ ] File upload works correctly
- [ ] Excel parsing functions properly
- [ ] Field mappings work
- [ ] Custom syntax parser works
- [ ] Card creation succeeds
- [ ] Preview feature works
- [ ] Error handling functions
- [ ] UI is responsive on mobile
- [ ] All buttons are functional

---

**Congratulations!** Your Excel to Cards Importer Power-Up is now deployed and ready to use! 🎊

For additional help, refer to the main README.md file or create an issue in your repository.