import { useEffect } from "react";

const SITE_NAME = "VelocityAI";
const SITE_URL = "https://velocityai.app";
const DEFAULT_OG_IMAGE = "/pwa-512x512.png";
const DEFAULT_DESCRIPTION =
    "Transform your study notes into AI-powered summaries and quizzes. VelocityAI helps students learn smarter with affordable AI-driven study tools.";

interface SEOProps {
    /** Page-specific title. Will be formatted as "Page Title – VelocityAI" */
    title?: string;
    /** Page-specific meta description (max ~160 chars) */
    description?: string;
    /** Path portion of the canonical URL, e.g. "/features" */
    canonicalPath?: string;
    /** Absolute URL of the OG image (defaults to the PWA icon) */
    ogImage?: string;
    /** JSON-LD structured data object to inject as a script tag */
    structuredData?: object;
}

function setMeta(name: string, content: string, property = false) {
    const attr = property ? "property" : "name";
    let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
    if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
    }
    el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
    let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
    }
    el.setAttribute("href", href);
}

function setStructuredData(data: object) {
    const id = "ld-json-schema";
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
        el = document.createElement("script");
        el.id = id;
        el.type = "application/ld+json";
        document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
}

export default function SEO({
    title,
    description = DEFAULT_DESCRIPTION,
    canonicalPath = "/",
    ogImage = DEFAULT_OG_IMAGE,
    structuredData,
}: SEOProps) {
    const fullTitle = title ? `${title} – ${SITE_NAME}` : `${SITE_NAME} – AI-Powered Learning Platform`;
    const canonicalUrl = `${SITE_URL}${canonicalPath}`;
    const absoluteOgImage = ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`;

    useEffect(() => {
        // Title
        document.title = fullTitle;

        // Basic meta
        setMeta("description", description);

        // Canonical
        setLink("canonical", canonicalUrl);

        // Open Graph
        setMeta("og:type", "website", true);
        setMeta("og:site_name", SITE_NAME, true);
        setMeta("og:title", fullTitle, true);
        setMeta("og:description", description, true);
        setMeta("og:url", canonicalUrl, true);
        setMeta("og:image", absoluteOgImage, true);

        // Twitter Card
        setMeta("twitter:card", "summary_large_image");
        setMeta("twitter:title", fullTitle);
        setMeta("twitter:description", description);
        setMeta("twitter:image", absoluteOgImage);

        // JSON-LD
        if (structuredData) {
            setStructuredData(structuredData);
        }
    }, [fullTitle, description, canonicalUrl, absoluteOgImage, structuredData]);

    return null;
}
