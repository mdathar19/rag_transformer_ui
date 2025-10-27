import { useEffect } from 'react';

/**
 * SEO Component - Updates page meta tags dynamically
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @param {string} props.keywords - Page keywords (comma-separated)
 * @param {string} props.canonical - Canonical URL
 * @param {string} props.ogImage - Open Graph image URL
 * @param {string} props.ogType - Open Graph type (default: website)
 */
export function SEO({
  title = 'RagSense - AI-Powered RAG Chatbot Platform',
  description = 'Deploy intelligent AI chatbots in minutes with RagSense. Automatically index your website content and provide instant, accurate answers to customers 24/7.',
  keywords = 'AI chatbot, RAG platform, customer support automation, website chatbot, intelligent chatbot, AI customer service, automated support, conversational AI, RagSense, chatbot platform',
  canonical = 'https://runit.in',
  ogImage = 'https://runit.in/favicon_io/android-chrome-512x512.png',
  ogType = 'website',
}) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name, content, property = false) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);

      if (element) {
        element.setAttribute('content', content);
      } else {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        element.setAttribute('content', content);
        document.head.appendChild(element);
      }
    };

    // Update basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Update Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:url', canonical, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:type', ogType, true);

    // Update Twitter Card tags
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonical);
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', canonical);
      document.head.appendChild(canonicalLink);
    }
  }, [title, description, keywords, canonical, ogImage, ogType]);

  return null; // This component doesn't render anything
}

// Export predefined SEO configurations for public pages only
// Note: Dashboard pages are behind authentication and use noindex
export const SEOConfig = {
  login: {
    title: 'Sign In - RagSense Lab | Access Your AI Chatbot Dashboard',
    description: 'Sign in to RagSense Lab to manage your AI-powered RAG chatbots. Access your dashboard, manage website content, and configure intelligent customer support.',
    keywords: 'RagSense Lab login, AI chatbot dashboard, RAG platform signin, customer support login',
    canonical: 'https://lab.ragsense.co/login',
  },

  signup: {
    title: 'Create Account - RagSense Lab | Start Building AI Chatbots',
    description: 'Create your RagSense Lab account and start building intelligent AI chatbots. Deploy RAG-powered customer support, index website content, and automate responses.',
    keywords: 'RagSense Lab signup, create AI chatbot account, RAG platform registration, start free',
    canonical: 'https://lab.ragsense.co/signup',
  },

  // Dashboard pages - These should not be indexed (authenticated pages)
  dashboard: {
    title: 'Dashboard - RagSense Lab',
    description: 'Manage your AI chatbots, view analytics, and configure settings.',
    keywords: 'chatbot dashboard, AI analytics',
    canonical: 'https://lab.ragsense.co/dashboard',
  },

  websites: {
    title: 'Websites - RagSense Lab',
    description: 'Add and manage website URLs for AI chatbot indexing.',
    keywords: 'website indexing, content management',
    canonical: 'https://lab.ragsense.co/dashboard/websites',
  },

  chat: {
    title: 'Query & Chat - RagSense Lab',
    description: 'Test and interact with your AI chatbot.',
    keywords: 'AI chat test, chatbot testing',
    canonical: 'https://lab.ragsense.co/dashboard/query',
  },

  settings: {
    title: 'Settings - RagSense Lab',
    description: 'Manage your account settings and configurations.',
    keywords: 'account settings, chatbot settings',
    canonical: 'https://lab.ragsense.co/dashboard/settings',
  },
};
