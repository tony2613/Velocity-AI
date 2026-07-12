import React, { useState, useEffect } from 'react';
import { X, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

const IosInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = velocityState();

  function velocityState() {
    return useState(false);
  }

  useEffect(() => {
    // Check if the user is on an iOS device
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };

    // Check if the app is already in standalone mode
    const isInStandaloneMode = () => {
      return ('standalone' in window.navigator) && (window.navigator as any).standalone;
    };

    // Check if the user has dismissed the prompt before
    const hasDismissed = localStorage.getItem('iosInstallPromptDismissed');

    if (isIos() && !isInStandaloneMode() && !hasDismissed) {
      setShowPrompt(true);
    }
  }, []);

  const dismissPrompt = () => {
    localStorage.setItem('iosInstallPromptDismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-8 bg-background border-t shadow-lg sm:hidden animate-in slide-in-from-bottom">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold">Install VelocityAI</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Install this application on your home screen for quick and easy access when you're on the go.
          </p>
          <div className="mt-3 text-xs flex items-center gap-2">
            <span>Just tap</span>
            <span className="p-1.5 bg-secondary rounded-md inline-flex items-center justify-center">
              <Share className="h-4 w-4" />
            </span>
            <span>then <strong>"Add to Home Screen"</strong></span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={dismissPrompt} className="ml-4 -mt-2 -mr-2">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default IosInstallPrompt;
