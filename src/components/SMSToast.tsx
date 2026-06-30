import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSMSJourney } from '../context/SMSJourneyContext';

const AUTO_DISMISS_MS = 5000;

export function SMSToastContainer() {
  const { activeToast, dismissToast, openIframe } = useSMSJourney();

  return (
    <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 10000, width: '100%', maxWidth: 360, padding: '0 16px', pointerEvents: 'none' }}>
      <AnimatePresence mode="wait">
        {activeToast && (
          <SMSToastItem
            key={activeToast.id}
            toast={activeToast}
            onDismiss={dismissToast}
            onView={() => { dismissToast(); openIframe(activeToast.iframePath, activeToast.name); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SMSToastItem({ toast, onDismiss, onView }: { toast: { id: string; name: string; message: string }; onDismiss: () => void; onView: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [toast.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{ pointerEvents: 'auto' }}
    >
      <div style={{ background: 'rgba(22,22,22,0.97)', borderRadius: 16, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {/* App icon */}
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(145deg,#c9a84c,#e8c96a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#c9a84c', marginBottom: 2 }}>Black Tuxedo</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
            {toast.message}
          </div>
        </div>

        {/* View link */}
        <button onClick={onView} style={{ background: 'none', border: 'none', color: '#c9a84c', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0, padding: '0 2px' }}>
          View
        </button>
      </div>
    </motion.div>
  );
}
