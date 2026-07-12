import { useState, useEffect, useRef, useCallback } from 'react';

const DEBUG_TIMER = false; // Set to true to debug timer stages in console

const THRESHOLDS = [
  { seconds: 3600, label: "1 hour" },
  { seconds: 7200, label: "2 hours" },
  { seconds: 10800, label: "3 hours" },
];

export function useStudyTimer() {
  const [activeSeconds, setActiveSeconds] = useState(() => {
    try {
      const saved = sessionStorage.getItem('velocity_study_time');
      const parsed = saved ? parseInt(saved, 10) : 0;
      return isNaN(parsed) ? 0 : parsed;
    } catch {
      return 0;
    }
  });
  
  const [celebration, setCelebration] = useState<{ duration: string } | null>(null);
  
  const achievedThresholds = useRef<Set<number>>(new Set(
    (() => {
      try {
        const stored = sessionStorage.getItem('velocity_achieved_thresholds');
        const parsed = stored ? JSON.parse(stored) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })()
  ));

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(interval);
      } else {
        startInterval();
      }
    };

    const startInterval = () => {
      interval = setInterval(() => {
        setActiveSeconds((prev) => {
          const next = prev + 1;
          sessionStorage.setItem('velocity_study_time', next.toString());
          
          // Just tick the timer and save to session storage
          return next;
        });
      }, 1000);
    };

    // Start immediately if visible
    if (!document.hidden) {
      startInterval();
    }

    // Reset timer on fresh mount in dev mode to make testing thresholds reliable
    if (import.meta.env.DEV) {
      sessionStorage.removeItem('velocity_study_time');
      sessionStorage.removeItem('velocity_achieved_thresholds');
      achievedThresholds.current.clear();
      setActiveSeconds(0);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Separate effect to watch the activeSeconds and trigger the celebration
  useEffect(() => {
    if (activeSeconds === 0) return; // Skip initial state

    if (DEBUG_TIMER && activeSeconds % 10 === 0) {
      console.log(`[Study Timer] Ticking: ${activeSeconds} seconds active`);
    }

    let triggeredThreshold = null;
    
    for (const t of THRESHOLDS) {
      if (activeSeconds >= t.seconds && !achievedThresholds.current.has(t.seconds)) {
        if (DEBUG_TIMER) console.log(`[Study Timer] Threshold crossed: ${t.label} (${t.seconds}s)`);
        achievedThresholds.current.add(t.seconds);
        triggeredThreshold = t;
      }
    }

    if (triggeredThreshold) {
      if (DEBUG_TIMER) console.log(`[Study Timer] Triggering popup for: ${triggeredThreshold.label}`);
      sessionStorage.setItem('velocity_achieved_thresholds', JSON.stringify(Array.from(achievedThresholds.current)));
      setCelebration({ duration: triggeredThreshold.label });
    }
  }, [activeSeconds]);

  const clearCelebration = useCallback(() => setCelebration(null), []);

  return { activeSeconds, celebration, clearCelebration };
}
