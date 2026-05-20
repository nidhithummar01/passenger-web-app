import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { GlassCard, GoldButton } from '../components/GlassCard';
import {
  MapPin, Car, Navigation,
  CreditCard, DollarSign, CheckCircle2, Gift, Lock, Sparkles,
  User, Crown, Wallet, ArrowRight, ArrowLeft, Apple, Bell, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { TuxedoLogo } from '../components/TuxedoLogo';
import type { RideStatus, User as AppUser } from '../types';

const LS_HAS_INSTALLED_APP = 'tuxedoHasInstalledApp';
const LS_PENDING_RIDE_CREDIT = 'tuxedoPendingRideCredit';
const LS_LAST_SMS_OFFER = 'tuxedoLastSmsOffer';
const LS_SAVED_PAYMENT_METHOD = 'tuxedoSavedPaymentMethod';
const APP_DOWNLOAD_POPUP_DELAY_MS = 5000;
const MEMBERSHIP_AFTER_ONBOARD_DELAY_MS = 30000;
const RIDE_STATUS_TIMELINE: Array<{ delay: number; status: RideStatus }> = [
  { delay: 0, status: 'arriving' },
  { delay: 15000, status: 'arrived' },
  { delay: 30000, status: 'onboard' },
  { delay: 45000, status: 'enroute' },
  { delay: 90000, status: 'completed' },
];

const STATUS_COPY: Partial<Record<RideStatus, { title: string; body: string; icon: 'bell' | 'car' | 'pin' | 'star' }>> = {
  arriving: {
    title: 'Chauffeur is on the way',
    body: 'Track progress and be ready near your pickup location.',
    icon: 'car',
  },
  arrived: {
    title: 'Chauffeur has arrived',
    body: 'Please meet your chauffeur at the pickup location.',
    icon: 'pin',
  },
  onboard: {
    title: 'Ride started',
    body: 'You are on your way to the destination.',
    icon: 'car',
  },
  enroute: {
    title: 'Ride in progress',
    body: 'Enjoy your ride. We will notify you when it is complete.',
    icon: 'car',
  },
  completed: {
    title: 'Ride completed',
    body: 'Thanks for riding with Tuxedo. Please rate your experience.',
    icon: 'star',
  },
};

type StatusNotice = NonNullable<(typeof STATUS_COPY)[RideStatus]>;

function getSavedPaymentMethod(user: AppUser | null): string | null {
  return user?.savedPaymentMethod || localStorage.getItem(LS_SAVED_PAYMENT_METHOD);
}

function createPendingAppOffer(user: AppUser | null) {
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + 15 * 60 * 1000);
  const token = Math.random().toString(36).slice(2, 8).toUpperCase();
  const payload = {
    code: `TUX100-${token}`,
    amount: 100,
    linkedIdentity: { phone: user?.phone || null, email: user?.email || null },
    status: 'pending_app_login',
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  localStorage.setItem(LS_PENDING_RIDE_CREDIT, JSON.stringify(payload));
  localStorage.setItem(
    LS_LAST_SMS_OFFER,
    JSON.stringify({
      type: 'app-download',
      sentAt: issuedAt.toISOString(),
      message: 'Download the Tuxedo app to claim $100 toward your next ride.',
      link: 'https://apps.apple.com',
      code: payload.code,
      expiresAt: payload.expiresAt,
    })
  );
}

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
  amenities: ['Wi-Fi', 'Water', 'TV / AUX / karaoke', 'Nappa leather'],
};

export const PassengerTrackingWeb = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, setActiveRide } = useApp();

  const deepLinkPickup = searchParams.get('pickup') || '';
  const isConciergePickup = Boolean(searchParams.get('token'));
  const [step, setStep] = useState<'config' | 'payment' | 'secure-payment' | 'tracking'>('config');
  const [dropOffLocation, setDropOffLocation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [showPromo, setShowPromo] = useState(false);
  // Popup only shown after payment completion
  const [showAppPopup, setShowAppPopup] = useState(false);
  const [popupSkippedOnce, setPopupSkippedOnce] = useState(false);
  const [appOfferShown, setAppOfferShown] = useState(false);
  const [membershipOfferShown, setMembershipOfferShown] = useState(false);
  /** After pay: app download first; later prompts can sell membership (re-notify = new chance). */
  const [appPromoVariant, setAppPromoVariant] = useState<'app' | 'membership'>('app');
  const [rideStatus, setRideStatus] = useState<RideStatus | null>(null);
  const [statusNotice, setStatusNotice] = useState<StatusNotice | null>(null);
  const [showRideCompletePopup, setShowRideCompletePopup] = useState(false);
  const isMemberFlag = localStorage.getItem('isMember') === 'true';
  const [hasPremiumAmenities, setHasPremiumAmenities] = useState<boolean>(isMemberFlag || user?.isMember === true);
  const [assignedDriver, setAssignedDriver] = useState<TrackingDriverDisplay>(DEFAULT_ASSIGNED);
  const membershipTimerRef = useRef<number | null>(null);
  const [reserveMeta, setReserveMeta] = useState<{
    date?: string;
    time?: string;
    pickup?: string;
    serviceType?: 'transfer' | 'hourly';
    hourlyHours?: number;
  }>({});

  useEffect(() => {
    const state = location.state as Record<string, unknown> | null;
    if (!state || typeof state !== 'object') return;

    if (state.fromMembershipPurchase || state.fromMembershipSkip) {
      const selectedPaymentMethod = (state.paymentMethod as string) || 'Payment Method';
      const membershipPurchased = Boolean(state.fromMembershipPurchase);
      setPaymentMethod(selectedPaymentMethod);
      setStep('tracking');
      setHasPremiumAmenities(membershipPurchased);
      setShowPromo(membershipPurchased);
      if (state.selectedDriver) {
        const d = state.selectedDriver as any;
        const amenities: string[] = [];
        if (d.amenities?.wifi) amenities.push('Wi-Fi');
        if (d.amenities?.water) amenities.push('Water');
        if (d.amenities?.music) amenities.push('TV / AUX / karaoke');
        if (d.amenities?.charger) amenities.push('USB power');
        if (d.vehicle?.interior) amenities.push(d.vehicle.interior);
        setAssignedDriver({
          name: `${d.name.split(' ')[0]} ${d.name.split(' ')[1]?.[0]}.`,
          rating: String(d.rating),
          vehicle: `${d.vehicle?.color} ${d.vehicle?.model}`,
          amenities,
        });
      }
      setPopupSkippedOnce(false);
      setAppPromoVariant('app');
      setShowAppPopup(false);
      setActiveRide((prev: any) => ({ ...(prev || {}), dropOffLocation, paymentMethod: selectedPaymentMethod, status: 'tracking' }));
      navigate(location.pathname + location.search, { replace: true, state: null });
      return;
    }

    if (state.reservedDate) {
      setReserveMeta({
        date: state.reservedDate as string,
        time: state.reservedTime as string | undefined,
        pickup: state.pickupLocation as string | undefined,
        serviceType: state.serviceType === 'hourly' ? 'hourly' : 'transfer',
        hourlyHours: typeof state.hourlyHours === 'number' ? state.hourlyHours : undefined,
      });
      navigate(location.pathname + location.search, { replace: true, state: null });
    }
  }, [location.state, location.pathname, location.search, navigate, user, setActiveRide, dropOffLocation]);

  const isMember = isMemberFlag || user?.isMember === true;
  const pickupLocation = deepLinkPickup || reserveMeta.pickup || user?.hotelName || 'The Grand Majestic Hotel';
  const rideStatusLabel =
    rideStatus === 'arrived'
      ? 'Your chauffeur has arrived at pickup'
      : rideStatus === 'onboard'
        ? `Ride started in a ${assignedDriver.vehicle}`
        : rideStatus === 'enroute'
          ? `On the way to ${dropOffLocation || 'your destination'}`
          : rideStatus === 'completed'
            ? 'Ride complete'
            : `Your chauffeur is ~3 mins away in a ${assignedDriver.vehicle}`;

  useEffect(() => {
    if (step !== 'tracking') {
      setRideStatus(null);
      setStatusNotice(null);
      setShowRideCompletePopup(false);
      return;
    }

    const timers = RIDE_STATUS_TIMELINE.map(({ delay, status }) =>
      window.setTimeout(() => {
        setRideStatus(status);
        setActiveRide((prev: any) => ({
          ...(prev || {}),
          dropOffLocation,
          paymentMethod,
          status,
        }));
        if (status === 'completed') {
          setShowAppPopup(false);
          setShowRideCompletePopup(true);
        }
      }, delay)
    );

    return () => timers.forEach(window.clearTimeout);
  }, [step, setActiveRide, dropOffLocation, paymentMethod]);

  useEffect(() => {
    if (step !== 'tracking') {
      setAppOfferShown(false);
      setPopupSkippedOnce(false);
      setMembershipOfferShown(false);
      if (membershipTimerRef.current) {
        window.clearTimeout(membershipTimerRef.current);
        membershipTimerRef.current = null;
      }
    }
  }, [step]);

  useEffect(() => {
    if (!rideStatus) return;
    const nextNotice = STATUS_COPY[rideStatus];
    if (!nextNotice) return;

    setStatusNotice(nextNotice);
    const timer = window.setTimeout(() => setStatusNotice(null), rideStatus === 'completed' ? 6000 : 4200);
    return () => window.clearTimeout(timer);
  }, [rideStatus]);

  useEffect(() => {
    if (step !== 'tracking') return;
    if (appOfferShown) return;
    if (rideStatus === 'completed') return;
    if (localStorage.getItem(LS_HAS_INSTALLED_APP) === 'true') return;

    setShowAppPopup(false);
    setAppPromoVariant('app');

    const timer = setTimeout(() => {
      if (localStorage.getItem(LS_HAS_INSTALLED_APP) === 'true') return;
      createPendingAppOffer(user);
      setAppOfferShown(true);
      setShowAppPopup(true);
    }, APP_DOWNLOAD_POPUP_DELAY_MS);

    return () => clearTimeout(timer);
  }, [step, rideStatus, appOfferShown, user]);

  useEffect(() => {
    if (step !== 'tracking') return;
    if (rideStatus !== 'onboard') return;
    if (!popupSkippedOnce || membershipOfferShown) return;
    if (localStorage.getItem('isMember') === 'true' || user?.isMember === true) return;
    if (membershipTimerRef.current) return;

    membershipTimerRef.current = window.setTimeout(() => {
      setAppPromoVariant('membership');
      setMembershipOfferShown(true);
      setShowAppPopup(true);
      membershipTimerRef.current = null;
      localStorage.setItem(
        LS_LAST_SMS_OFFER,
        JSON.stringify({
          type: 'membership',
          sentAt: new Date().toISOString(),
          message: 'Buy Tuxedo Gold for $100/month and get $100 toward your next ride.',
        })
      );
    }, MEMBERSHIP_AFTER_ONBOARD_DELAY_MS);
  }, [step, rideStatus, popupSkippedOnce, membershipOfferShown, user?.isMember]);

  const handleBackNavigation = () => {
    const savedPaymentMethod = getSavedPaymentMethod(user);
    if (step === 'tracking') { setStep(savedPaymentMethod ? 'config' : 'payment'); return; }
    if (step === 'secure-payment') { setStep(savedPaymentMethod ? 'config' : 'payment'); return; }
    if (step === 'payment') { setStep('config'); return; }
    navigate(-1);
  };

  const handleRequestChauffeur = () => {
    const savedPaymentMethod = getSavedPaymentMethod(user);
    setActiveRide((prev: any) => ({ ...(prev || {}), dropOffLocation, paymentMethod: savedPaymentMethod, status: 'configuring', driverMoving: true }));
    if (savedPaymentMethod) {
      setPaymentMethod(savedPaymentMethod);
      setStep('secure-payment');
      return;
    }
    setStep('payment');
  };


  const handlePaymentSelection = (method: string) => {
    setPaymentMethod(method);
    setStep('secure-payment');
  };

  const handleSecurePaymentConfirm = () => {
    if (paymentMethod) localStorage.setItem(LS_SAVED_PAYMENT_METHOD, paymentMethod);
    const memberStatus = localStorage.getItem('isMember') === 'true' || user?.isMember === true;
    setHasPremiumAmenities(memberStatus);
    setPopupSkippedOnce(false);
    setAppOfferShown(false);
    setMembershipOfferShown(false);
    setAppPromoVariant('app');
    setActiveRide((prev: any) => ({ ...(prev || {}), dropOffLocation, paymentMethod, status: 'tracking' }));
    setShowAppPopup(false);
    setStep('tracking');
  };


  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.13),transparent_34%),#020202] p-4 font-sans text-white flex flex-col">
      <div className="max-w-md mx-auto w-full space-y-6 pt-8 flex-grow">
        <div className="mb-7">
          <button onClick={handleBackNavigation} className={`mb-4 text-base text-[#D4AF37] hover:text-[#B8962A] flex items-center gap-2 font-semibold ${step === 'config' ? 'invisible' : ''}`}>
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <div className="text-center">
            <TuxedoLogo className="mx-auto h-10 w-auto" />
            {step !== 'config' && (
              <div className="mt-3 inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/25 text-[#D4AF37] text-sm font-bold">
                <Navigation className="w-4 h-4 animate-pulse" />
                {step === 'tracking' ? 'CHAUFFEUR EN ROUTE' : 'RIDE SETUP'}
              </div>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'config' && (
            <motion.div key="config" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
              <GlassCard className="p-5 border-white/10 bg-white/[0.035] shadow-[0_24px_70px_-35px_rgba(212,175,55,0.55)]">
                <div className="mb-6">
                  <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#D4AF37]">Private Chauffeur</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Where are you going?</h2>
                  <p className="mt-1 text-sm font-medium text-gray-500">Enter your destination and we’ll match a chauffeur.</p>
                </div>
                <div className="space-y-3">
                  {reserveMeta.date ? (
                    <div className="p-3 rounded-2xl border border-[#D4AF37]/25 bg-[#D4AF37]/5 text-center">
                      <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest mb-1">Reserved ride</p>
                      <p className="text-xs text-white font-bold">
                        {new Date(reserveMeta.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        {reserveMeta.time ? ` · ${reserveMeta.time}` : ''}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1 uppercase">
                        {reserveMeta.serviceType === 'hourly' ? `${reserveMeta.hourlyHours || 2} hour minimum` : 'Transfer (A → B)'}
                      </p>
                    </div>
                  ) : null}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e] shadow-[0_0_18px_rgba(34,197,94,0.55)]" />
                      <p className="text-[10px] text-[#D4AF37] uppercase font-black tracking-widest">Pickup</p>
                    </div>
                    <p className="text-base text-white font-bold leading-snug">{pickupLocation}</p>
                    <p className="text-[11px] text-gray-500 mt-1">{isConciergePickup ? 'Set by concierge' : 'Current pickup location'}</p>
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37] w-5 h-5" />
                    <input type="text" placeholder="Drop-off location" value={dropOffLocation} onChange={(e) => setDropOffLocation(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/55 py-4 pl-12 pr-4 font-bold text-white outline-none transition placeholder:text-gray-500 focus:border-[#D4AF37]/70 focus:bg-black" />
                  </div>
                  <GoldButton onClick={handleRequestChauffeur} className="mt-2 w-full py-4 text-base uppercase font-black tracking-wide rounded-2xl" disabled={!dropOffLocation}>
                    Continue to Ride
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


              </GlassCard>
            </motion.div>
          )}

          {step === 'tracking' && (
            <motion.div key="tracking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <DummyMap pickup={pickupLocation} dropoff={dropOffLocation} driverName={assignedDriver.name} />
              {reserveMeta.date ? (
                <div className="p-3 rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/5 text-center -mt-2">
                  <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest mb-1">Reserved ride</p>
                  <p className="text-xs text-white font-bold">
                    {new Date(reserveMeta.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    {reserveMeta.time ? ` · ${reserveMeta.time}` : ''}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase">
                    {reserveMeta.serviceType === 'hourly' ? `${reserveMeta.hourlyHours || 2} hour minimum` : 'Transfer (A → B)'}
                  </p>
                </div>
              ) : null}
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
                <p className="text-gray-400 font-medium mb-6 uppercase text-[10px] tracking-widest">{rideStatusLabel}</p>
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
          {statusNotice && (
            <RideStatusToast notice={statusNotice} onClose={() => setStatusNotice(null)} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showRideCompletePopup && (
            <RideCompletePopup
              driverName={assignedDriver.name}
              onDone={() => {
                setShowRideCompletePopup(false);
                setShowPromo(false);
                setShowAppPopup(false);
                setActiveRide(null);
                setDropOffLocation('');
                setStep('config');
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAppPopup && (
            <AppDownloadPopup
              variant={appPromoVariant}
              user={user}
              onClose={() => setShowAppPopup(false)}
              onSkip={() => {
                setShowAppPopup(false);
                const memberNow = localStorage.getItem('isMember') === 'true' || user?.isMember === true;
                if (appPromoVariant === 'app' && !memberNow) {
                  setPopupSkippedOnce(true);
                }
              }}
              onMarkHasApp={() => {
                localStorage.setItem(LS_HAS_INSTALLED_APP, 'true');
                setShowAppPopup(false);
              }}
            />
          )}
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
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{isMember ? `$${user?.rideCredit?.toFixed(2)} ride credit` : '$100/mo · $100 toward your next ride'}</p>
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

const StatusIcon = ({ icon, className = 'h-5 w-5 text-black' }: { icon: StatusNotice['icon']; className?: string }) => {
  if (icon === 'car') return <Car className={className} />;
  if (icon === 'pin') return <MapPin className={className} />;
  if (icon === 'star') return <Star className={className} fill="currentColor" />;
  return <Bell className={className} />;
};

const RideStatusToast = ({ notice, onClose }: { notice: StatusNotice; onClose: () => void }) => (
  <motion.button
    type="button"
    onClick={onClose}
    initial={{ opacity: 0, y: -18, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -18, scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    className="fixed left-4 right-4 top-5 z-[120] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-[#D4AF37]/45 bg-[#101010]/95 p-4 text-left shadow-2xl shadow-[#D4AF37]/20 backdrop-blur-xl"
  >
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]">
      <StatusIcon icon={notice.icon} />
    </span>
    <span className="min-w-0">
      <span className="block text-sm font-black text-white">{notice.title}</span>
      <span className="mt-1 block text-xs font-medium leading-5 text-gray-400">{notice.body}</span>
    </span>
  </motion.button>
);

const RideCompletePopup = ({ driverName, onDone }: { driverName: string; onDone: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[110] flex items-center justify-center bg-black/65 p-6 backdrop-blur-sm"
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 24 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="w-full max-w-sm"
    >
      <GlassCard className="border-green-500/35 p-8 text-center shadow-2xl shadow-green-500/20">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-4 border-green-500/25 bg-green-500/10">
          <CheckCircle2 className="h-11 w-11 text-green-500" />
        </div>
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#D4AF37]">Ride Complete</p>
        <h3 className="mb-3 text-3xl font-black uppercase italic text-white">Your ride is complete</h3>
        <p className="mb-8 text-sm font-medium leading-6 text-gray-400">
          Thanks for riding with Tuxedo. {driverName} has completed your trip.
        </p>
        <GoldButton onClick={onDone} className="w-full rounded-2xl py-4 text-base font-black uppercase">
          Done
        </GoldButton>
      </GlassCard>
    </motion.div>
  </motion.div>
);

const AppDownloadPopup = ({
  variant,
  user,
  onClose,
  onSkip,
  onMarkHasApp,
}: {
  variant: 'app' | 'membership';
  user: AppUser | null;
  onClose: () => void;
  onSkip?: () => void;
  onMarkHasApp?: () => void;
}) => {
  const navigate = useNavigate();
  const handleDownloadApp = () => {
    localStorage.setItem(LS_HAS_INSTALLED_APP, 'true');
    if (!localStorage.getItem(LS_PENDING_RIDE_CREDIT)) {
      createPendingAppOffer(user);
    }
    window.open('https://apps.apple.com', '_blank');
    onClose();
  };
  const handleMembership = () => {
    onClose();
    navigate('/membership');
  };
  if (variant === 'membership') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="w-full max-w-sm">
          <GlassCard className="p-8 text-center border-[#D4AF37]/40 shadow-2xl shadow-[#D4AF37]/30">
            <div className="w-16 h-16 bg-[#D4AF37]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#D4AF37]/30">
              <Crown className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest mb-2">Tuxedo Gold</p>
            <h3 className="text-3xl font-black text-[#D4AF37] mb-1">$100</h3>
            <p className="text-sm text-gray-300 font-medium mb-8">toward your next ride each month with membership — $100/mo, credit does not roll over.</p>
            <div className="space-y-3">
              <GoldButton onClick={handleMembership} className="w-full py-4 text-base font-black uppercase">
                Buy membership
              </GoldButton>
              <button onClick={onSkip ?? onClose} className="w-full py-3 text-sm font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors">
                Not now
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="w-full max-w-sm">
        <GlassCard className="p-8 text-center border-[#D4AF37]/40 shadow-2xl shadow-[#D4AF37]/30">
          <div className="w-16 h-16 bg-[#D4AF37]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#D4AF37]/30">
            <Gift className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest mb-2">Mobile app</p>
          <h3 className="text-4xl font-black text-[#D4AF37] mb-1">Get $100</h3>
          <p className="text-base text-gray-300 font-medium mb-8">toward your next ride when you download the Tuxedo app.</p>
          <div className="space-y-3">
            <GoldButton onClick={handleDownloadApp} className="w-full py-4 text-base font-black uppercase">
              Download app
            </GoldButton>
            <button
              type="button"
              onClick={() => onMarkHasApp?.()}
              className="w-full py-2 text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors underline"
            >
              I already have the app
            </button>
            <button onClick={onSkip ?? onClose} className="w-full py-3 text-sm font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors">
              Skip for now
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




