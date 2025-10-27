# SEO Documentation - RagSense Lab

## Overview
This document outlines the SEO implementation for RagSense Lab (lab.ragsense.co), the authenticated RAG platform application.

## Important Notes
- **Domain**: This application runs on `lab.ragsense.co` (subdomain)
- **Main Website**: The marketing website is at `runit.in` (Next.js)
- **Public Pages**: Only `/login` and `/signup` are publicly accessible
- **Authenticated Pages**: Dashboard and all other pages require authentication

## SEO Strategy

### For Authenticated Application
Since this is an authenticated application, most pages should NOT be indexed by search engines:
- Dashboard pages use `noindex, nofollow`
- Only login and signup pages are allowed in robots.txt
- Minimal sitemap with only public pages

## Implemented SEO Features

### 1. Meta Tags (index.html)

#### Primary Meta Tags
```html
<title>RagSense Lab - AI-Powered RAG Platform | Sign In or Create Account</title>
<meta name="description" content="Access RagSense Lab to manage your AI-powered RAG chatbots..." />
<meta name="keywords" content="RagSense Lab, AI chatbot login, RAG platform..." />
<meta name="robots" content="noindex, nofollow" />
```

#### Open Graph Tags (Social Media)
```html
<meta property="og:type" content="website" />
<meta property="og:url" content="https://lab.ragsense.co" />
<meta property="og:title" content="RagSense Lab - AI-Powered RAG Platform" />
<meta property="og:image" content="https://lab.ragsense.co/favicon_io/android-chrome-512x512.png" />
```

#### Twitter Card Tags
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="RagSense Lab - AI-Powered RAG Platform" />
<meta name="twitter:image" content="https://lab.ragsense.co/favicon_io/android-chrome-512x512.png" />
```

### 2. Structured Data (JSON-LD)

Two structured data schemas are included:

#### SoftwareApplication Schema
```json
{
  "@type": "SoftwareApplication",
  "name": "RagSense Lab",
  "applicationCategory": "BusinessApplication",
  "url": "https://lab.ragsense.co",
  "publisher": {
    "@type": "Organization",
    "name": "RagSense",
    "url": "https://runit.in"
  }
}
```

#### WebApplication Schema
```json
{
  "@type": "WebApplication",
  "name": "RagSense Lab",
  "url": "https://lab.ragsense.co",
  "applicationCategory": "BusinessApplication"
}
```

### 3. Robots.txt

Location: `/public/robots.txt`

**Key Points:**
- Disallows all pages by default
- Only allows `/login` and `/signup`
- Blocks AI scrapers (GPTBot, Claude-Web, etc.)
- Points to sitemap

```
User-agent: *
Disallow: /
Allow: /login$
Allow: /signup$
Disallow: /dashboard
Disallow: /api
Sitemap: https://lab.ragsense.co/sitemap.xml
```

### 4. Sitemap

Location: `/public/sitemap.xml`

**Includes only public pages:**
- https://lab.ragsense.co/login
- https://lab.ragsense.co/signup

Dashboard pages are excluded as they're authenticated.

### 5. Security.txt

Location: `/public/.well-known/security.txt`

Provides security contact information for responsible disclosure:
```
Contact: mailto:no-reply@runit.in
Canonical: https://lab.ragsense.co/.well-known/security.txt
```

### 6. Dynamic SEO Component

Location: `/src/components/SEO.jsx`

**Features:**
- Updates page title and meta tags dynamically
- Exports predefined SEO configs for each page
- Updates canonical URLs
- Updates Open Graph and Twitter Card tags

**Usage:**
```jsx
import { SEO, SEOConfig } from '../components/SEO';

function Login() {
  return (
    <>
      <SEO {...SEOConfig.login} />
      {/* Page content */}
    </>
  );
}
```

**Available Configs:**
- `SEOConfig.login` - Login page
- `SEOConfig.signup` - Signup page
- `SEOConfig.dashboard` - Dashboard (authenticated, noindex)
- `SEOConfig.websites` - Websites page (authenticated)
- `SEOConfig.chat` - Chat page (authenticated)
- `SEOConfig.settings` - Settings page (authenticated)

### 7. Favicons

All favicon files are properly linked from `/public/favicon_io/`:
- favicon-16x16.png
- favicon-32x32.png
- apple-touch-icon.png
- android-chrome-192x192.png
- android-chrome-512x512.png
- site.webmanifest

### 8. Performance Optimizations

```html
<!-- Preconnect for Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

## Page-Specific SEO

### Login Page (/login)
```javascript
{
  title: 'Sign In - RagSense Lab | Access Your AI Chatbot Dashboard',
  description: 'Sign in to RagSense Lab to manage your AI-powered RAG chatbots...',
  keywords: 'RagSense Lab login, AI chatbot dashboard, RAG platform signin',
  canonical: 'https://lab.ragsense.co/login'
}
```

### Signup Page (/signup)
```javascript
{
  title: 'Create Account - RagSense Lab | Start Building AI Chatbots',
  description: 'Create your RagSense Lab account and start building intelligent AI chatbots...',
  keywords: 'RagSense Lab signup, create AI chatbot account, RAG platform registration',
  canonical: 'https://lab.ragsense.co/signup'
}
```

### Dashboard Pages
All dashboard pages include basic SEO but with `noindex` robots directive since they're authenticated.

## SEO Checklist

✅ Meta tags (title, description, keywords)
✅ Open Graph tags for social sharing
✅ Twitter Card tags
✅ Structured data (JSON-LD)
✅ Robots.txt properly configured
✅ XML Sitemap with public pages only
✅ Canonical URLs
✅ Favicon properly linked
✅ Security.txt for responsible disclosure
✅ Dynamic SEO component for page-specific tags
✅ Performance optimizations (preconnect)
✅ Mobile-friendly meta tags
✅ Theme color for mobile browsers

## Testing SEO

### 1. Google Rich Results Test
Test structured data: https://search.google.com/test/rich-results

### 2. Meta Tags Debugger
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/

### 3. Robots.txt Testing
Visit: https://lab.ragsense.co/robots.txt

### 4. Sitemap Testing
Visit: https://lab.ragsense.co/sitemap.xml

### 5. Security.txt
Visit: https://lab.ragsense.co/.well-known/security.txt

## Maintenance

### When Adding New Public Pages
1. Update `/src/components/SEO.jsx` with new config
2. Update `/public/sitemap.xml` with new URL
3. Update `/public/robots.txt` if needed
4. Add SEO component to the new page

### When Changing Domain/Subdomain
1. Update `index.html` meta tags
2. Update `SEO.jsx` canonical URLs
3. Update `sitemap.xml` URLs
4. Update `robots.txt` sitemap URL
5. Update structured data URLs

## Best Practices Followed

1. **Semantic HTML**: Proper use of HTML5 semantic tags
2. **Accessibility**: ARIA labels where needed
3. **Mobile-First**: Responsive meta tags and viewport settings
4. **Performance**: Preconnect for external resources
5. **Security**: Security.txt for vulnerability reporting
6. **Privacy**: Robots directives for authenticated pages
7. **Social Media**: Complete Open Graph and Twitter Card implementation
8. **Schema.org**: Structured data for better search understanding

## Notes for Deployment

1. Replace placeholder social media URLs in structured data
2. Verify all URLs use correct domain (lab.ragsense.co)
3. Submit sitemap to Google Search Console
4. Verify robots.txt is accessible
5. Test meta tags with debugging tools
6. Monitor Google Search Console for indexing issues

## Contact

For SEO-related questions or improvements:
- Email: no-reply@runit.in
- Main Website: https://runit.in
