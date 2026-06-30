import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';

export type SMSStepId = 1 | 2 | 3 | 4 | 5 | 6;
export type SMSStatus = 'pending' | 'sent';

export interface SMSStep {
  id: SMSStepId;
  name: string;
  trigger: string;
  message: string;
  status: SMSStatus;
  sentAt?: string;
  iframePath: string;
}

export interface SMSToast {
  id: string;
  smsId: SMSStepId;
  name: string;
  message: string;
  iframePath: string;
}

const STEPS: SMSStep[] = [
  {
    id: 1,
    name: 'Welcome',
    trigger: 'After booking confirmed',
    message: 'Welcome to Black Tuxedo 🎩 Your ride is confirmed. Download our app and get $100 off your next ride.',
    status: 'pending',
    iframePath: '/track-ride',
  },
  {
    id: 2,
    name: 'Driver On The Way',
    trigger: 'Driver assigned & en route',
    message: 'Your chauffeur is on his way 🚘 Track him live here — Arriving in ~5 min.',
    status: 'pending',
    iframePath: '/track-ride',
  },
  {
    id: 3,
    name: 'App Offer ($100)',
    trigger: 'While passenger is tracking',
    message: '🎁 Special offer: Download the Black Tuxedo app and get $100 off your next ride. Claim it now.',
    status: 'pending',
    iframePath: '/track-ride',
  },
  {
    id: 4,
    name: 'Driver Arrived',
    trigger: 'Chauffeur at pickup location',
    message: 'Your Black Tuxedo chauffeur has arrived 🎩 Look for the vehicle at your pickup. Safe travels!',
    status: 'pending',
    iframePath: '/track-ride',
  },
  {
    id: 5,
    name: 'Membership Offer',
    trigger: 'Trip started / during ride',
    message: 'Upgrade to Tuxedo Gold 👑 Priority dispatch, premium amenities & exclusive member rates.',
    status: 'pending',
    iframePath: '/membership',
  },
  {
    id: 6,
    name: 'Thank You',
    trigger: 'Trip completed',
    message: 'Thank you for riding with Black Tuxedo 🎩 We hope to see you again soon.',
    status: 'pending',
    iframePath: '/track-ride',
  },
];

interface SMSJourneyContextType {
  steps: SMSStep[];
  activeToast: SMSToast | null;
  activeIframe: { path: string; smsName: string } | null;
  triggerSMS: (id: SMSStepId) => void;
  dismissToast: () => void;
  openIframe: (path: string, smsName: string) => void;
  closeIframe: () => void;
  resetJourney: () => void;
}

const SMSJourneyContext = createContext<SMSJourneyContextType | undefined>(undefined);

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const SMSJourneyProvider = ({ children }: { children: ReactNode }) => {
  const [steps, setSteps] = useState<SMSStep[]>(STEPS);
  // Queue: array of toasts waiting to be shown
  const queueRef = useRef<SMSToast[]>([]);
  const [activeToast, setActiveToast] = useState<SMSToast | null>(null);
  const showingRef = useRef(false);
  const [activeIframe, setActiveIframe] = useState<{ path: string; smsName: string } | null>(null);

  const showNext = useCallback(() => {
    const next = queueRef.current.shift();
    if (next) {
      showingRef.current = true;
      setActiveToast(next);
    } else {
      showingRef.current = false;
      setActiveToast(null);
    }
  }, []);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
    // Wait for exit animation then show next
    setTimeout(showNext, 350);
  }, [showNext]);

  const triggerSMS = useCallback((id: SMSStepId) => {
    setSteps((prev) => {
      const already = prev.find((s) => s.id === id);
      if (already?.status === 'sent') return prev;
      return prev.map((s) =>
        s.id === id ? { ...s, status: 'sent' as SMSStatus, sentAt: nowTime() } : s,
      );
    });

    // Find step to build toast
    const step = STEPS.find((s) => s.id === id);
    if (!step) return;

    // Check not already sent
    setSteps((prev) => {
      const current = prev.find((s) => s.id === id);
      if (!current) return prev;

      const toast: SMSToast = {
        id: `sms-${id}-${Date.now()}`,
        smsId: id,
        name: step.name,
        message: step.message,
        iframePath: step.iframePath,
      };

      if (!showingRef.current) {
        // Show immediately
        showingRef.current = true;
        setActiveToast(toast);
      } else {
        // Queue it
        queueRef.current.push(toast);
      }
      return prev;
    });
  }, []);

  const openIframe = useCallback((path: string, smsName: string) => {
    setActiveIframe({ path, smsName });
  }, []);

  const closeIframe = useCallback(() => {
    setActiveIframe(null);
  }, []);

  const resetJourney = useCallback(() => {
    setSteps(STEPS);
    queueRef.current = [];
    showingRef.current = false;
    setActiveToast(null);
    setActiveIframe(null);
  }, []);

  return (
    <SMSJourneyContext.Provider
      value={{ steps, activeToast, activeIframe, triggerSMS, dismissToast, openIframe, closeIframe, resetJourney }}
    >
      {children}
    </SMSJourneyContext.Provider>
  );
};

export const useSMSJourney = () => {
  const ctx = useContext(SMSJourneyContext);
  if (!ctx) throw new Error('useSMSJourney must be used within SMSJourneyProvider');
  return ctx;
};
