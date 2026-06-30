import { useState } from 'react';
import { useSMSJourney, SMSStep, SMSStepId } from '../context/SMSJourneyContext';

export function SMSJourneyPanel() {
  const { steps, triggerSMS, resetJourney, openIframe } = useSMSJourney();
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<SMSStep | null>(null);

  const sentCount = steps.filter((s) => s.status === 'sent').length;

  function handleSend(id: SMSStepId, e?: React.MouseEvent) {
    e?.stopPropagation();
    triggerSMS(id);
    setPreview(null);
  }

  function handleReset() {
    resetJourney();
    setPreview(null);
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          zIndex: 9999,
          background: 'linear-gradient(135deg, #c9a84c 0%, #f0d080 50%, #c9a84c 100%)',
          border: 'none',
          borderRadius: '50%',
          width: 56,
          height: 56,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(201,168,76,0.45)',
          flexDirection: 'column',
          gap: 2,
        }}
        title="SMS Journey"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {sentCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 6,
            right: 6,
            background: '#111',
            color: '#c9a84c',
            borderRadius: '50%',
            width: 18,
            height: 18,
            fontSize: 10,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1.5px solid #c9a84c',
          }}>{sentCount}</span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 96,
          right: 28,
          zIndex: 9998,
          width: 360,
          maxHeight: '80vh',
          background: '#0a0a0a',
          border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: 16,
          boxShadow: '0 8px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'inherit',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 18px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(201,168,76,0.06)',
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#c9a84c', letterSpacing: 0.5 }}>
                SMS JOURNEY
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
                {sentCount} of 6 sent
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                onClick={handleReset}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6,
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 11,
                  padding: '4px 8px',
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
              <button
                onClick={() => { setOpen(false); setPreview(null); }}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '2px 4px' }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Steps list */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '10px 0' }}>
            {steps.map((step, i) => {
              const isNext = step.status === 'pending' && steps.slice(0, i).every((s) => s.status === 'sent');
              const isSent = step.status === 'sent';

              return (
                <div
                  key={step.id}
                  onClick={() => setPreview(preview?.id === step.id ? null : step)}
                  style={{
                    padding: '11px 18px',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: preview?.id === step.id ? 'rgba(201,168,76,0.07)' : 'transparent',
                    transition: 'background 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  {/* Step number / status icon */}
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: isSent ? '2px solid #c9a84c' : isNext ? '2px solid rgba(201,168,76,0.6)' : '2px solid rgba(255,255,255,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    background: isSent ? 'rgba(201,168,76,0.15)' : 'transparent',
                  }}>
                    {isSent ? (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 700, color: isNext ? '#c9a84c' : 'rgba(255,255,255,0.25)' }}>
                        {step.id}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: isSent ? '#c9a84c' : isNext ? '#fff' : 'rgba(255,255,255,0.4)',
                    }}>
                      {step.name}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>
                      {isSent ? `Sent at ${step.sentAt}` : step.trigger}
                    </div>
                  </div>

                  {/* Send button (next only) */}
                  {isNext && (
                    <button
                      onClick={(e) => handleSend(step.id, e)}
                      style={{
                        background: 'linear-gradient(135deg, #c9a84c, #f0d080)',
                        border: 'none',
                        borderRadius: 6,
                        color: '#111',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '5px 10px',
                        cursor: 'pointer',
                        flexShrink: 0,
                        letterSpacing: 0.3,
                      }}
                    >
                      Send
                    </button>
                  )}

                  {/* Sent badge */}
                  {isSent && (
                    <span style={{ fontSize: 10, color: '#c9a84c', fontWeight: 600, flexShrink: 0 }}>
                      ✓ Sent
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* SMS Preview */}
          {preview && (
            <div style={{
              borderTop: '1px solid rgba(201,168,76,0.2)',
              padding: '14px 18px 16px',
              background: 'rgba(201,168,76,0.04)',
            }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                SMS Preview — {preview.name}
              </div>

              {/* Phone SMS bubble */}
              <div style={{
                background: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '10px 13px',
              }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>Black Tuxedo</div>
                <div style={{
                  background: '#2c2c2e',
                  borderRadius: '14px 14px 14px 4px',
                  padding: '10px 12px',
                  fontSize: 12,
                  lineHeight: 1.55,
                  color: '#fff',
                  maxWidth: '90%',
                }}>
                  {preview.message}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 5, textAlign: 'right' }}>
                  {preview.sentAt ?? 'Not yet sent'}
                </div>
              </div>

              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                {preview.status === 'pending' && (
                  <button
                    onClick={() => handleSend(preview.id)}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #c9a84c, #f0d080)',
                      border: 'none',
                      borderRadius: 8,
                      color: '#111',
                      fontSize: 13,
                      fontWeight: 700,
                      padding: '10px 0',
                      cursor: 'pointer',
                      letterSpacing: 0.4,
                    }}
                  >
                    Send SMS {preview.id} — {preview.name}
                  </button>
                )}
                {preview.status === 'sent' && (
                  <button
                    onClick={() => openIframe(preview.iframePath, preview.name)}
                    style={{
                      flex: 1,
                      background: 'rgba(201,168,76,0.1)',
                      border: '1px solid rgba(201,168,76,0.3)',
                      borderRadius: 8,
                      color: '#c9a84c',
                      fontSize: 13,
                      fontWeight: 700,
                      padding: '10px 0',
                      cursor: 'pointer',
                      letterSpacing: 0.4,
                    }}
                  >
                    Open Link ↗
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
