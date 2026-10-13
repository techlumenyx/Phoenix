import { useEffect } from 'react';

const SITE_URL = 'https://christianlistings.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

interface PageSeoConfig {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: string;
}

function ensureMetaTag(selector: string, attributes: Record<string, string>) {
  const element = document.head.querySelector(selector) ?? document.createElement('meta');

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  if (!document.head.contains(element)) {
    document.head.appendChild(element);
  }

  return element;
}

function ensureCanonicalLink(url: string) {
  const element = document.head.querySelector('link[rel="canonical"]') ?? document.createElement('link');
  element.setAttribute('rel', 'canonical');
  element.setAttribute('href', url);

  if (!document.head.contains(element)) {
    document.head.appendChild(element);
  }

  return element;
}

export function usePageSeo({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = 'website',
}: PageSeoConfig) {
  useEffect(() => {
    const canonicalUrl = new URL(path, SITE_URL).toString();

    document.title = title;

    ensureMetaTag('meta[name="description"]', {
      name: 'description',
      content: description,
    });

    ensureCanonicalLink(canonicalUrl);

    ensureMetaTag('meta[property="og:type"]', {
      property: 'og:type',
      content: type,
    });

    ensureMetaTag('meta[property="og:url"]', {
      property: 'og:url',
      content: canonicalUrl,
    });

    ensureMetaTag('meta[property="og:title"]', {
      property: 'og:title',
      content: title,
    });

    ensureMetaTag('meta[property="og:description"]', {
      property: 'og:description',
      content: description,
    });

    ensureMetaTag('meta[property="og:image"]', {
      property: 'og:image',
      content: image,
    });

    ensureMetaTag('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: 'summary_large_image',
    });
  }, [title, description, path, image, type]);
}
