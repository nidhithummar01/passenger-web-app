import { motion, AnimatePresence } from 'motion/react';
import { useSMSJourney } from '../context/SMSJourneyContext';

// ─── Inline content panels per SMS step ────────────────────────────────────

function WelcomePanel() {
  return (
    <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🎩</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>Ride Confirmed</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>Your Black Tuxedo chauffeur is assigned</div>
      </div>

      <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 16, padding: '16px 18px' }}>
        <div style={{ fontSize: 10, color: '#c9a84c', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>RIDE DETAILS</div>
        <Row label="Pickup" value="Times Square, New York" />
        <Row label="Drop-off" value="JFK Airport, Terminal 4" />
        <Row label="Vehicle" value="Black S-Class · TUX-204" />
        <Row label="ETA" value="Arriving in ~5 min" last />
      </div>

      <div style={{ background: 'linear-gradient(135deg,#1a1400,#2a1e00)', border: '1px solid rgba(201,168,76,0.35)', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ fontSize: 28 }}>📱</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#c9a84c' }}>Get $100 off your next ride</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Download the Black Tuxedo app</div>
        </div>
      </div>

      <GoldButton>Download App</GoldButton>
    </div>
  );
}

function DriverOnWayPanel() {
  return (
    <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Map placeholder */}
      <div style={{ borderRadius: 16, overflow: 'hidden', height: 180, background: 'linear-gradient(135deg,#0d1a0d,#0a120a)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <svg width="100%" height="100%" viewBox="0 0 340 180" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <radialGradient id="mapglow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.07" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="340" height="180" fill="url(#mapglow)" />
          {/* Grid lines */}
          {[40,80,120,160,200,240,280,320].map(x => <line key={x} x1={x} y1="0" x2={x} y2="180" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />)}
          {[36,72,108,144].map(y => <line key={y} x1="0" y1={y} x2="340" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />)}
          {/* Route line */}
          <path d="M 60 140 Q 120 100 170 90 Q 220 80 270 50" stroke="#c9a84c" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="6 4" />
          {/* Car dot */}
          <circle cx="170" cy="90" r="8" fill="#c9a84c" opacity="0.9" />
          <circle cx="170" cy="90" r="14" fill="#c9a84c" opacity="0.15" />
          {/* Destination pin */}
          <circle cx="270" cy="50" r="6" fill="#fff" opacity="0.7" />
        </svg>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#c9a84c' }}>LIVE TRACKING</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Chauffeur en route</div>
        </div>
      </div>

      {/* Driver card */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 50, height: 50, borderRadius: 14, background: 'linear-gradient(135deg,#1a1400,#3a2800)', border: '2px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#c9a84c', flexShrink: 0 }}>
          MS
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', fontStyle: 'italic' }}>MICHAEL S.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
            <Stars />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>4.9 · ELITE RATED</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#c9a84c' }}>5<span style={{ fontSize: 13 }}>min</span></div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>ARRIVING</div>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 20 }}>🚗</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Black S-Class</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Luxury Sedan · TUX-204</div>
        </div>
      </div>
    </div>
  );
}

function AppOfferPanel() {
  return (
    <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <div style={{ width: 80, height: 80, borderRadius: 22, background: 'linear-gradient(145deg,#c9a84c,#e8c96a)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(201,168,76,0.35)' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: '#c9a84c', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>LIMITED OFFER</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>Get $100 Off</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 8, lineHeight: 1.5 }}>
          Download the Black Tuxedo app and save on your next luxury ride
        </div>
      </div>

      <div style={{ width: '100%', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 14, padding: '14px 18px' }}>
        {['Priority dispatch', 'Live chauffeur tracking', 'Exclusive member rates', 'Seamless rebooking'].map((f) => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{f}</span>
          </div>
        ))}
      </div>

      <GoldButton>Download Free · Save $100</GoldButton>
    </div>
  );
}

function DriverArrivedPanel() {
  return (
    <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>Your Chauffeur Has Arrived</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>Look for the vehicle at your pickup point</div>
      </div>

      <div style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: 'linear-gradient(135deg,#1a1400,#3a2800)', border: '2px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#c9a84c' }}>MS</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', fontStyle: 'italic' }}>MICHAEL S.</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Black S-Class · TUX-204</div>
        </div>
        <div style={{ marginLeft: 'auto', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '4px 10px' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e' }}>ARRIVED</span>
        </div>
      </div>

      <GoldButton>I'm on my way ↗</GoldButton>
    </div>
  );
}

function MembershipPanel() {
  return (
    <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ borderRadius: 16, background: 'linear-gradient(135deg,#1a1200,#2e1e00)', border: '1px solid rgba(201,168,76,0.35)', padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>👑</div>
        <div style={{ fontSize: 11, color: '#c9a84c', fontWeight: 700, letterSpacing: 1.5 }}>TUXEDO GOLD</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginTop: 4 }}>Upgrade Your Journey</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 6, lineHeight: 1.5 }}>Priority dispatch · Premium amenities · Exclusive rates</div>
      </div>

      {[
        { icon: '⚡', title: 'Priority Dispatch', desc: 'Guaranteed pickup in under 3 minutes' },
        { icon: '🥂', title: 'Premium Amenities', desc: 'Refreshments, WiFi & luxury comfort' },
        { icon: '💎', title: 'Exclusive Rates', desc: 'Up to 30% off every ride' },
      ].map((b) => (
        <div key={b.title} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 22 }}>{b.icon}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{b.title}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{b.desc}</div>
          </div>
        </div>
      ))}

      <GoldButton>Join Tuxedo Gold</GoldButton>
    </div>
  );
}

function ThankYouPanel() {
  return (
    <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <div style={{ fontSize: 48 }}>🎩</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>Thank You</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 6, lineHeight: 1.5 }}>
          We hope you enjoyed your Black Tuxedo experience
        </div>
      </div>

      <div style={{ width: '100%', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 16, padding: '16px 18px' }}>
        <Row label="Trip" value="Times Square → JFK" />
        <Row label="Chauffeur" value="Michael S. · 4.9 ★" />
        <Row label="Vehicle" value="Black S-Class" last />
      </div>

      <div style={{ display: 'flex', gap: 12, width: '100%' }}>
        <div style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '14px 10px', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>⭐</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Rate Ride</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '14px 10px', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>🔄</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Book Again</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '14px 10px', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>📱</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Get App</div>
        </div>
      </div>

      <GoldButton>Book Your Next Ride</GoldButton>
    </div>
  );
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function Stars() {
  return (
    <div style={{ display: 'flex', gap: 1 }}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill="#c9a84c" stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function GoldButton({ children }: { children: React.ReactNode }) {
  return (
    <button style={{ width: '100%', background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', border: 'none', borderRadius: 14, color: '#111', fontSize: 14, fontWeight: 800, padding: '15px 0', cursor: 'pointer', letterSpacing: 0.4, boxShadow: '0 4px 20px rgba(201,168,76,0.3)' }}>
      {children}
    </button>
  );
}

// ─── Panel router ────────────────────────────────────────────────────────────

const PANEL_MAP: Record<string, React.FC> = {
  'Welcome': WelcomePanel,
  'Driver On The Way': DriverOnWayPanel,
  'App Offer ($100)': AppOfferPanel,
  'Driver Arrived': DriverArrivedPanel,
  'Membership Offer': MembershipPanel,
  'Thank You': ThankYouPanel,
};

// ─── Overlay shell ───────────────────────────────────────────────────────────

export function SMSIframeOverlay() {
  const { activeIframe, closeIframe } = useSMSJourney();

  const Panel = activeIframe ? (PANEL_MAP[activeIframe.smsName] ?? WelcomePanel) : null;

  return (
    <AnimatePresence>
      {activeIframe && Panel && (
        <motion.div
          key="sms-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={closeIframe}
          style={{ position: 'fixed', inset: 0, zIndex: 9990, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
        >
          <motion.div
            key="sms-panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 430, maxHeight: '90vh', background: '#0d0d0d', borderRadius: '24px 24px 0 0', border: '1px solid rgba(201,168,76,0.2)', borderBottom: 'none', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 -16px 60px rgba(0,0,0,0.8)' }}
          >
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px', flexShrink: 0 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)' }} />
            </div>

            {/* Header */}
            <div style={{ padding: '8px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#c9a84c', letterSpacing: 0.4 }}>Black Tuxedo · {activeIframe.smsName}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', marginTop: 1 }}>SMS Message</div>
              </div>
              <button onClick={closeIframe} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 700, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                ×
              </button>
            </div>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <Panel />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
