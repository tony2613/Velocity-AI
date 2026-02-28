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

    useEffect(() => {
        // 1. Check if it's already installed (Standalone mode)
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        setIsInstalled(mediaQuery.matches);

        const handleDisplayModeChange = (e: MediaQueryListEvent) => {
            setIsInstalled(e.matches);
        };
        mediaQuery.addEventListener('change', handleDisplayModeChange);

        // 2. Listen for the install prompt (Chrome/Edge/Android)
        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Update UI notify the user they can install the PWA
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

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

        // If it's iOS Safari and not already installed, flag it so we can show custom instructions
        if (isIosDevice && isSafari && !mediaQuery.matches) {
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
        if (isIOS) {
            // Return true to indicate we need to show the iOS instructions modal
            return true;
        }

        if (!deferredPrompt) {
            return false;
        }

        // Show the install prompt
        await deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsInstallable(false);
        return false;
    };

    return { isInstallable, isInstalled, isIOS, promptInstall };
}
