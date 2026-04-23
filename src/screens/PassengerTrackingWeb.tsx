import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { GlassCard, GoldButton } from '../components/GlassCard';
import {
  MapPin, Car, Navigation,
  CreditCard, DollarSign, CheckCircle2, Gift, Lock, Sparkles,
  User, Crown, Wallet, ArrowRight, ArrowLeft, Apple
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import type { User as AppUser } from '../types';

type TrackingDriverDisplay = {
  name: string;
  rating: string;
  vehicle: string;
  amenities: string[];
};

const DEFAULT_ASSIGNED: TrackingDriverDisplay = {
  name: 'Michael S.',
  rating: '4.9',
  vehicle: 'Black S-Class',
  amenities: ['WiFi', 'Refreshments', 'Leather Interior'],
};

export const PassengerTrackingWeb = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, setActiveRide } = useApp();

  const deepLinkPickup = searchParams.get('pickup') || '';
  const [step, setStep] = useState<'config' | 'payment' | 'secure-payment' | 'tracking'>('config');
  const [dropOffLocation, setDropOffLocation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [showPromo, setShowPromo] = useState(false);
  // Popup only shown after payment completion
  const [showAppPopup, setShowAppPopup] = useState(false);
  const isMemberFlag = localStorage.getItem('isMember') === 'true';
  const [hasPremiumAmenities, setHasPremiumAmenities] = useState<boolean>(isMemberFlag || user?.isMember === true);
  const [assignedDriver, setAssignedDriver] = useState<TrackingDriverDisplay>(DEFAULT_ASSIGNED);

  useEffect(() => {
    const state = location.state as { fromMembershipPurchase?: boolean; fromMembershipSkip?: boolean; paymentMethod?: string; selectedDriver?: any; } | null;
    if (!state?.fromMembershipPurchase && !state?.fromMembershipSkip) return;
    const selectedPaymentMethod = state.paymentMethod || 'Payment Method';
    const membershipPurchased = Boolean(state.fromMembershipPurchase);
    setPaymentMethod(selectedPaymentMethod);
    setStep('tracking');
    setHasPremiumAmenities(membershipPurchased);
    setShowPromo(membershipPurchased);
    // Show popup after payment completion
    setShowAppPopup(true);
    setActiveRide((prev: any) => ({ ...(prev || {}), dropOffLocation, paymentMethod: selectedPaymentMethod, status: 'tracking' }));
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state]);

  const isMember = isMemberFlag || user?.isMember === true;
  const pickupLocation = deepLinkPickup || user?.hotelName || 'The Grand Majestic Hotel';

  const handleBackNavigation = () => {
    if (step === 'tracking') { setStep('payment'); return; }
    if (step === 'secure-payment') { setStep('payment'); return; }
    if (step === 'payment') { setStep('config'); return; }
    navigate(-1);
  };

  const handleRequestChauffeur = () => {
    setActiveRide((prev: any) => ({ ...(prev || {}), dropOffLocation, status: 'tracking', driverMoving: true }));
    setStep('payment');
  };


  const handlePaymentSelection = (method: string) => {
    setPaymentMethod(method);
    setStep('secure-payment');
  };

  const handleSecurePaymentConfirm = () => {
    setActiveRide((prev: any) => ({ ...(prev || {}), dropOffLocation, paymentMethod, status: 'tracking' }));
    setShowAppPopup(true);
    setStep('tracking');
  };


  return (
    <div className="min-h-screen bg-black p-4 font-sans text-white flex flex-col">
      <div className="max-w-md mx-auto w-full space-y-6 pt-8 flex-grow">
        <div className="mb-8">
          <button onClick={handleBackNavigation} className={`mb-4 text-base text-[#D4AF37] hover:text-[#B8962A] flex items-center gap-2 font-semibold ${step === 'config' ? 'invisible' : ''}`}>
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight mb-2 uppercase italic">TUXEDO</h1>
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] text-sm font-bold">
              <Navigation className="w-4 h-4 animate-pulse" />
              {step === 'tracking' ? 'CHAUFFEUR EN ROUTE' : 'RIDE CONFIGURATION'}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'config' && (
            <motion.div key="config" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <GlassCard className="p-6 border-[#D4AF37]/20">
                <h2 className="text-xl font-bold mb-4 uppercase italic">Start Your Journey</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-[#D4AF37]/10 rounded-xl border-2 border-[#D4AF37]/40">
                    <p className="text-[10px] text-[#D4AF37] uppercase font-black mb-1">Pickup Location</p>
                    <p className="text-base text-white font-bold">{pickupLocation}</p>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase">Set by Concierge</p>
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37] w-5 h-5" />
                    <input type="text" placeholder="Enter Drop-off Location" value={dropOffLocation} onChange={(e) => setDropOffLocation(e.target.value)} className="w-full bg-black/50 border-2 border-[#D4AF37]/30 rounded-xl py-4 pl-12 pr-4 focus:border-[#D4AF37] outline-none font-bold text-white" />
                  </div>
                  <GoldButton onClick={handleRequestChauffeur} className="w-full py-5 text-xl uppercase font-black" disabled={!dropOffLocation}>
                    Request Chauffeur
                  </GoldButton>

                </div>
              </GlassCard>
            </motion.div>
          )}

          {step === 'payment' && (
            <motion.div key="payment" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <GlassCard className="p-6">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold uppercase italic tracking-tight">Select Payment Method</h2>
                  <p className="text-xs text-gray-500 mt-2 font-medium uppercase tracking-widest">Secure Payment Processing</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {[{ name: 'Apple Pay', icon: Apple }, { name: 'PayPal', icon: Wallet }, { name: 'Credit Card', icon: CreditCard }, { name: 'Cash Payment', icon: DollarSign }].map((method) => {
                    const MethodIcon = method.icon;
                    return (
                      <button key={method.name} onClick={() => handlePaymentSelection(method.name)} className={`flex items-center gap-4 p-4 bg-white/5 border-2 rounded-xl transition-all ${paymentMethod === method.name ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-white/10 hover:border-[#D4AF37]/30'}`}>
                        <MethodIcon className="text-[#D4AF37] w-5 h-5" />
                        <span className="font-bold text-base text-white">{method.name}</span>
                        {paymentMethod === method.name && <CheckCircle2 className="w-5 h-5 text-[#D4AF37] ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {step === 'secure-payment' && (
            <motion.div key="secure-payment" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <GlassCard className="p-6 border-[#D4AF37]/30">
                <div className="text-center mb-8">
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
                    <div className="w-16 h-16 bg-[#D4AF37]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#D4AF37]/30">
                      <Lock className="w-8 h-8 text-[#D4AF37]" />
                    </div>
                  </motion.div>
                  <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Secure Payment</h2>
                  <p className="text-xs text-gray-500 mt-1 font-bold uppercase tracking-widest">256-bit SSL Encrypted</p>
                </div>

                <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl p-5 mb-6">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Payment Method</p>
                  <p className="text-lg font-black text-white">{paymentMethod}</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-medium">Ride Fare</span>
                    <span className="text-white font-bold">$24.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-medium">Service Fee</span>
                    <span className="text-white font-bold">$3.00</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between">
                    <span className="text-white font-black uppercase text-sm">Total</span>
                    <span className="text-[#D4AF37] font-black text-lg">$27.00</span>
                  </div>
                </div>

                <GoldButton onClick={handleSecurePaymentConfirm} className="w-full py-5 text-base font-black uppercase">
                  Confirm Payment
                </GoldButton>

                <div className="flex items-center justify-center gap-2 mt-4">
                  <Lock className="w-3 h-3 text-gray-600" />
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Secured by Tuxedo Financial</p>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {step === 'tracking' && (
            <motion.div key="tracking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <DummyMap pickup={pickupLocation} dropoff={dropOffLocation} driverName={assignedDriver.name} />
              <GlassCard className="p-8 text-center border-green-500/20">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <div className="flex justify-center items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full border-2 border-[#D4AF37] overflow-hidden bg-gray-900 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-700" />
                  </div>
                  <div className="w-28 h-16 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                    <Car className="text-[#D4AF37] opacity-40 w-10 h-10" />
                  </div>
                </div>
                <h2 className="text-2xl font-black mb-1 uppercase italic">{assignedDriver.name}</h2>
                <div className="flex items-center justify-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (<Sparkles key={i} className="w-3 h-3 text-[#D4AF37]" />))}
                  <span className="text-[10px] text-[#D4AF37] font-black ml-1 uppercase">{assignedDriver.rating} Rating</span>
                </div>
                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden mb-6 border border-white/10">
                  <motion.div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#D4AF37]/50 to-[#D4AF37]" initial={{ width: '10%' }} animate={{ width: '85%' }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} />
                </div>
                <p className="text-gray-400 font-medium mb-6 uppercase text-[10px] tracking-widest">Live: Driver is 3 mins away in a {assignedDriver.vehicle}</p>
                <div className="mb-6 p-4 bg-black/40 rounded-xl border border-white/5">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-tighter">Premium Amenities</span>
                  </div>
                  {hasPremiumAmenities ? (
                    <div className="flex flex-wrap justify-center gap-2">
                      {assignedDriver.amenities.map(a => (<span key={a} className="text-[10px] font-bold bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-1 rounded border border-[#D4AF37]/20">{a}</span>))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-gray-600 uppercase">Premium amenities locked</p>
                      <button onClick={() => navigate('/membership', { state: { fromTrackRide: true, paymentMethod } })} className="flex items-center justify-center gap-2 w-full py-2 bg-white/5 rounded-lg border border-dashed border-white/20 group hover:border-[#D4AF37]/40 transition-colors">
                        <Lock className="w-3 h-3 text-gray-600 group-hover:text-[#D4AF37]" />
                        <span className="text-[9px] font-black text-gray-600 uppercase group-hover:text-[#D4AF37]">Buy Membership</span>
                      </button>
                    </div>
                  )}
                </div>
                {showPromo && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-4 p-4 bg-[#D4AF37]/10 border-2 border-dashed border-[#D4AF37]/40 rounded-xl">
                    <Gift className="w-5 h-5 inline mr-2 text-[#D4AF37]" />
                    <span className="text-[#D4AF37] font-black uppercase text-xs">20% Off Your Next Journey!</span>
                  </motion.div>
                )}
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAppPopup && (<AppDownloadPopup user={user} onClose={() => setShowAppPopup(false)} />)}
        </AnimatePresence>
      </div>

      <div className="pb-6 mt-4">
        <div onClick={() => !isMember && navigate('/membership')} className="cursor-pointer">
          <GlassCard className={`p-4 flex items-center justify-between transition-all border-2 ${isMember ? 'border-[#D4AF37]/40 bg-[#D4AF37]/5' : 'border-white/10 hover:border-[#D4AF37]/30'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isMember ? 'bg-[#D4AF37]' : 'bg-white/5'}`}>
                <Crown className={`w-5 h-5 ${isMember ? 'text-black' : 'text-gray-500'}`} />
              </div>
              <div>
                <p className="text-[10px] font-black text-white uppercase italic tracking-tight">{isMember ? 'Tuxedo Gold Member' : 'Tuxedo Basic Status'}</p>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{isMember ? `$${user?.rideCredit?.toFixed(2)} Ride Credit` : 'Join for $100 & Get $100 Credit'}</p>
              </div>
            </div>
            {!isMember ? (
              <div className="bg-[#D4AF37] text-black p-2 rounded-lg"><ArrowRight className="w-4 h-4" /></div>
            ) : (
              <div className="flex items-center gap-1 text-[8px] font-black text-[#D4AF37] uppercase"><CheckCircle2 className="w-3 h-3" /> Active</div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

const AppDownloadPopup = ({ user, onClose }: { user: AppUser | null; onClose: () => void }) => {
  const navigate = useNavigate();
  const handleDownloadApp = () => {
    const token = Math.random().toString(36).slice(2, 8).toUpperCase();
    localStorage.setItem('pendingAppDownloadCoupon', JSON.stringify({ code: `TUX100-${token}`, amount: 100, linkedIdentity: { phone: user?.phone || null, email: user?.email || null }, status: 'pending_app_login', issuedAt: new Date().toISOString() }));
    window.open('https://apps.apple.com', '_blank');
    onClose();
  };
  const handleBuyMembership = () => {
    onClose();
    navigate('/membership');
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="w-full max-w-sm">
        <GlassCard className="p-8 text-center border-[#D4AF37]/40 shadow-2xl shadow-[#D4AF37]/30">
          <div className="w-16 h-16 bg-[#D4AF37]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#D4AF37]/30">
            <Gift className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest mb-2">Exclusive Offer</p>
          <h3 className="text-xl font-black text-white mb-2 leading-tight uppercase italic">FREE $100 Coupon</h3>
          <p className="text-sm text-gray-400 font-medium mb-8">Download our app or buy a membership and get <span className="text-[#D4AF37] font-bold">$100 free</span> on your next ride.</p>
          <div className="space-y-3">
            <GoldButton onClick={handleDownloadApp} className="w-full py-4 text-base font-black uppercase">
              Download App
            </GoldButton>
            <button
              onClick={handleBuyMembership}
              className="w-full py-4 rounded-xl border-2 border-[#D4AF37]/40 text-[#D4AF37] font-black text-sm uppercase tracking-widest hover:bg-[#D4AF37]/10 transition-all"
            >
              Buy Membership
            </button>
            <button onClick={onClose} className="w-full py-3 text-sm font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors">
              Skip for Now
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};

const DummyMap = ({ pickup, dropoff, driverName }: { pickup: string; dropoff: string; driverName: string }) => {
  const [progress, setProgress] = React.useState(0.15);
  React.useEffect(() => {
    const interval = setInterval(() => { setProgress(p => (p >= 0.88 ? 0.15 : p + 0.004)); }, 80);
    return () => clearInterval(interval);
  }, []);
  const W = 340, H = 200, startX = 48, startY = 160, endX = 292, endY = 48, cp1X = 100, cp1Y = 60, cp2X = 240, cp2Y = 170;
  const bezier = (t: number) => { const mt = 1 - t; return { x: mt*mt*mt*startX + 3*mt*mt*t*cp1X + 3*mt*t*t*cp2X + t*t*t*endX, y: mt*mt*mt*startY + 3*mt*mt*t*cp1Y + 3*mt*t*t*cp2Y + t*t*t*endY }; };
  const carPos = bezier(progress);
  const gridLines: React.ReactElement[] = [];
  for (let x = 0; x <= W; x += 40) gridLines.push(<line key={`v${x}`} x1={x} y1={0} x2={x} y2={H} stroke="#1a1a1a" strokeWidth="1" />);
  for (let y = 0; y <= H; y += 40) gridLines.push(<line key={`h${y}`} x1={0} y1={y} x2={W} y2={y} stroke="#1a1a1a" strokeWidth="1" />);
  return (
    <div className="rounded-2xl overflow-hidden border-2 border-[#D4AF37]/20 bg-[#0a0a0a]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-2"><Navigation className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" /><span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Live Tracking</span></div>
        <span className="text-[9px] text-gray-600 font-bold uppercase">Simulation</span>
      </div>
      <div className="relative">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="block">
          {gridLines}
          {[[80,40,60,50],[160,30,50,60],[240,50,55,45],[70,120,65,55],[155,110,50,60],[235,115,60,50]].map(([x,y,w,h],i) => (<rect key={i} x={x} y={y} width={w} height={h} rx="4" fill="#111" stroke="#1f1f1f" strokeWidth="1" />))}
          <path d={`M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`} fill="none" stroke="#D4AF37" strokeWidth="2" strokeDasharray="6 4" opacity="0.3" />
          <path d={`M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`} fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeDasharray={`${progress * 420} 999`} />
          <circle cx={startX} cy={startY} r="7" fill="#22c55e" opacity="0.9" /><circle cx={startX} cy={startY} r="3" fill="#fff" />
          <circle cx={endX} cy={endY} r="7" fill="#ef4444" opacity="0.9" /><circle cx={endX} cy={endY} r="3" fill="#fff" />
          <circle cx={carPos.x} cy={carPos.y} r="10" fill="#D4AF37" opacity="0.15" /><circle cx={carPos.x} cy={carPos.y} r="6" fill="#D4AF37" /><circle cx={carPos.x} cy={carPos.y} r="3" fill="#000" />
        </svg>
        <div className="absolute bottom-2 left-3 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-[9px] text-gray-400 font-bold max-w-[80px] truncate">{pickup || 'Pickup'}</span></div>
        <div className="absolute top-2 right-3 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-[9px] text-gray-400 font-bold max-w-[80px] truncate">{dropoff || 'Dropoff'}</span></div>
      </div>
      <div className="flex items-center justify-between px-4 py-2 border-t border-white/5">
        <div className="flex items-center gap-2"><Car className="w-3.5 h-3.5 text-[#D4AF37]" /><span className="text-[9px] text-gray-400 font-bold">{driverName} en route</span></div>
        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" /><span className="text-[9px] text-[#D4AF37] font-black uppercase">Live</span></div>
      </div>
    </div>
  );
};




