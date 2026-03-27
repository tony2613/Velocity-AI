import { useState, useEffect } from 'react';

// Define the type for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isInAppBrowser, setIsInAppBrowser] = useState(false);

    useEffect(() => {
        // 1. Check if it's already installed (Standalone mode)
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        setIsInstalled(mediaQuery.matches || (window.navigator as any).standalone === true);

        const handleDisplayModeChange = (e: MediaQueryListEvent) => {
            setIsInstalled(e.matches || (window.navigator as any).standalone === true);
        };
        mediaQuery.addEventListener('change', handleDisplayModeChange);

        // 2. Listen for the install prompt (Chrome/Edge/Android)
        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();

            // Stash the event so it can be triggered later.
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Update UI notify the user they can install the PWA
            // Only set installable if not already installed
            if (!mediaQuery.matches && !(window.navigator as any).standalone) {
                setIsInstallable(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Also check if beforeinstallprompt fired before React mounted
        // (This is rare but happens, we handle this by ensuring the event listener is top-level if needed,
        // but in a SPA like Vite/React, this effect usually binds in time)

        // 3. Listen for successful installation
        const handleAppInstalled = () => {
            // Hide the app-provided install promotion
            setIsInstallable(false);
            // Clear the deferredPrompt so it can be garbage collected
            setDeferredPrompt(null);
            setIsInstalled(true);
        };

        window.addEventListener('appinstalled', handleAppInstalled);

        // 4. Detect iOS Safari (where beforeinstallprompt is not supported)
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);
        
        // Detect in-app browsers like Instagram, Facebook, TikTok, etc.
        const inAppBrowserDetection = /instagram|fban|fbav|tiktok|wv/.test(userAgent);

        // If it's an in-app browser, aggressively flag it
        if (inAppBrowserDetection) {
            setIsInAppBrowser(true);
            setIsInstallable(true);
            setIsInstalled(false); // In-app browsers can never truly be the installed PWA
        } else if (isIosDevice && isSafari && !mediaQuery.matches && !(window.navigator as any).standalone) {
            // If it's iOS Safari and not already installed, flag it so we can show custom instructions
            setIsIOS(true);
            // We still want to show the button, but it will trigger a different action (a modal)
            setIsInstallable(true);
        }

        // Cleanup
        return () => {
            mediaQuery.removeEventListener('change', handleDisplayModeChange);
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const promptInstall = async () => {
        if (isInAppBrowser) {
            const userAgent = window.navigator.userAgent.toLowerCase();
            const isAndroid = /android/.test(userAgent);
            
            if (isAndroid) {
                // Force open in Chrome on Android
                const currentUrl = window.location.href;
                const urlWithoutProtocol = currentUrl.replace(/^https?:\/\//, '');
                
                window.location.href = `intent://${urlWithoutProtocol}#Intent;scheme=https;package=com.android.chrome;end`;
                
                // Small delay to allow intent to process before returning
                await new Promise(resolve => setTimeout(resolve, 500));
                return 'intent';
            }
            
            return 'in-app';
        }

        if (isIOS) {
            // Return true to indicate we need to show the iOS instructions modal
            return 'ios';
        }

        if (!deferredPrompt) {
            return 'none';
        }

        // Show the install prompt
        await deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        await deferredPrompt.userChoice;

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsInstallable(false);
        return 'prompted';
    };

    return { isInstallable, isInstalled, isIOS, isInAppBrowser, promptInstall };
}
