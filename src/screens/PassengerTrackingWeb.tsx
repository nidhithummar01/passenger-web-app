import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { GlassCard, GoldButton } from '../components/GlassCard';
import {
  MapPin, Car, Navigation,
  CreditCard, DollarSign, CheckCircle2, Gift, Lock, Sparkles,
  User, Crown, Wallet, ArrowRight, ArrowLeft, Apple, Bell, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DirectionsRenderer, GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { useApp } from '../context/AppContext';
import { TuxedoLogo } from '../components/TuxedoLogo';
import type { RideStatus, User as AppUser } from '../types';

const LS_HAS_INSTALLED_APP = 'tuxedoHasInstalledApp';
const LS_PENDING_RIDE_CREDIT = 'tuxedoPendingRideCredit';
const LS_LAST_SMS_OFFER = 'tuxedoLastSmsOffer';
const LS_SAVED_PAYMENT_METHOD = 'tuxedoSavedPaymentMethod';
const APP_DOWNLOAD_POPUP_DELAY_MS = 5000;
const MEMBERSHIP_AFTER_ONBOARD_DELAY_MS = 30000;
const GOOGLE_MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim();
const DEFAULT_US_PICKUP = 'Times Square, New York, NY, USA';
const FALLBACK_PICKUP = { lat: 40.758, lng: -73.9855 };
const FALLBACK_DROPOFF = { lat: 40.7614, lng: -73.9776 };
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
  const defaultPickupLocation = deepLinkPickup || DEFAULT_US_PICKUP;
  const isConciergePickup = Boolean(searchParams.get('token'));
  const [step, setStep] = useState<'config' | 'payment' | 'secure-payment' | 'tracking'>('config');
  const [pickupInput, setPickupInput] = useState(defaultPickupLocation);
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
      setActiveRide((prev: any) => ({
        ...(prev || {}),
        pickupLocation: pickupInput.trim() || defaultPickupLocation,
        dropOffLocation,
        paymentMethod: selectedPaymentMethod,
        status: 'tracking',
      }));
      navigate(location.pathname + location.search, { replace: true, state: null });
      return;
    }

    if (state.reservedDate) {
      const reservedPickup = (state.pickupLocation as string | undefined) || defaultPickupLocation;
      setReserveMeta({
        date: state.reservedDate as string,
        time: state.reservedTime as string | undefined,
        pickup: reservedPickup,
        serviceType: state.serviceType === 'hourly' ? 'hourly' : 'transfer',
        hourlyHours: typeof state.hourlyHours === 'number' ? state.hourlyHours : undefined,
      });
      setPickupInput(reservedPickup);
      navigate(location.pathname + location.search, { replace: true, state: null });
    }
  }, [defaultPickupLocation, location.state, location.pathname, location.search, navigate, user, setActiveRide, pickupInput, dropOffLocation]);

  const isMember = isMemberFlag || user?.isMember === true;
  const rideCreditLabel =
    typeof user?.rideCredit === 'number'
      ? `$${user.rideCredit.toFixed(2)} ride credit`
      : 'Ride credit active';
  const pickupLocation = pickupInput.trim() || reserveMeta.pickup || defaultPickupLocation;
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
          pickupLocation,
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
  }, [step, setActiveRide, pickupLocation, dropOffLocation, paymentMethod]);

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
          message: 'Upgrade to Tuxedo Gold for premium perks and ride credit.',
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
    setActiveRide((prev: any) => ({ ...(prev || {}), pickupLocation, dropOffLocation, paymentMethod: savedPaymentMethod, status: 'configuring', driverMoving: true }));
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
    setActiveRide((prev: any) => ({ ...(prev || {}), pickupLocation, dropOffLocation, paymentMethod, status: 'tracking' }));
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
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e] shadow-[0_0_18px_rgba(34,197,94,0.55)]" />
                        <p className="text-[10px] text-[#D4AF37] uppercase font-black tracking-widest">Pickup</p>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600">
                        {isConciergePickup ? 'Editable' : 'Current location'}
                      </span>
                    </div>
                    <div className="relative">
                      <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-[#22c55e] w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Pickup location"
                        value={pickupInput}
                        onChange={(e) => setPickupInput(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-black/55 py-4 pl-12 pr-4 font-bold text-white outline-none transition placeholder:text-gray-500 focus:border-[#D4AF37]/70 focus:bg-black"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37] w-5 h-5" />
                    <input type="text" placeholder="Drop-off location" value={dropOffLocation} onChange={(e) => setDropOffLocation(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/55 py-4 pl-12 pr-4 font-bold text-white outline-none transition placeholder:text-gray-500 focus:border-[#D4AF37]/70 focus:bg-black" />
                  </div>
                  <GoldButton onClick={handleRequestChauffeur} className="mt-2 w-full py-4 text-base uppercase font-black tracking-wide rounded-2xl" disabled={!pickupInput.trim() || !dropOffLocation.trim()}>
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
              <GoogleTrackingMap pickup={pickupLocation} dropoff={dropOffLocation} driverName={assignedDriver.name} />
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
              <GlassCard className="relative overflow-hidden border-[#D4AF37]/30 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.22),transparent_32%),linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))] p-0 shadow-2xl shadow-[#D4AF37]/10">
                <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-[#D4AF37]/10 blur-3xl" />
                <div className="absolute -bottom-24 -left-20 h-52 w-52 rounded-full bg-white/5 blur-3xl" />

                <div className="relative p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 rounded-full border border-green-500/25 bg-green-500/10 px-3 py-1.5">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-green-300">Chauffeur confirmed</span>
                    </div>
                    <div className="rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                      ~3 min
                    </div>
                  </div>

                  <div className="grid grid-cols-[1fr_auto] gap-4">
                    <div className="min-w-0">
                      <p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#D4AF37]">Your chauffeur</p>
                      <h2 className="truncate text-3xl font-black uppercase italic tracking-tight text-white">{assignedDriver.name}</h2>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                          ))}
                        </div>
                        <span className="text-[11px] font-black uppercase text-[#D4AF37]">{assignedDriver.rating}</span>
                        <span className="text-[10px] font-bold uppercase text-gray-500">Elite rated</span>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="h-20 w-20 rounded-3xl border border-[#D4AF37]/45 bg-gradient-to-br from-[#D4AF37]/25 to-white/[0.03] p-1 shadow-[0_0_35px_rgba(212,175,55,0.18)]">
                        <div className="flex h-full w-full items-center justify-center rounded-[20px] bg-[#10131a] text-2xl font-black text-[#D4AF37]">
                          {assignedDriver.name.split(' ').map(part => part[0]).join('').slice(0, 2)}
                        </div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 rounded-full border-2 border-black bg-green-500 p-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-black" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-3xl border border-white/10 bg-black/45 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-14 w-20 items-center justify-center rounded-2xl border border-[#D4AF37]/25 bg-[#D4AF37]/10">
                          <Car className="h-8 w-8 text-[#D4AF37]" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-white">{assignedDriver.vehicle}</p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">Luxury sedan</p>
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-right">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Plate</p>
                        <p className="text-xs font-black tracking-[0.18em] text-white">TUX-204</p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-gray-500">Arrival progress</span>
                        <span className="text-[#D4AF37]">En route</span>
                      </div>
                      <div className="relative h-2 overflow-hidden rounded-full border border-white/10 bg-white/5">
                        <motion.div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#8e7119] via-[#D4AF37] to-[#fff2b8]" initial={{ width: '14%' }} animate={{ width: '78%' }} transition={{ duration: 14, repeat: Infinity, ease: 'linear' }} />
                      </div>
                      <p className="mt-3 text-center text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">{rideStatusLabel}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-3xl border border-[#D4AF37]/20 bg-[#D4AF37]/[0.06] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#D4AF37]">Premium amenities</span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{hasPremiumAmenities ? 'Unlocked' : 'Gold only'}</span>
                    </div>
                    {hasPremiumAmenities ? (
                      <div className="grid grid-cols-2 gap-2">
                        {assignedDriver.amenities.map(a => (
                          <span key={a} className="rounded-xl border border-[#D4AF37]/20 bg-black/35 px-3 py-2 text-center text-[10px] font-black uppercase text-[#D4AF37]">{a}</span>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/15 bg-black/35 p-3">
                        <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-widest text-gray-500">Upgrade to unlock Wi-Fi, water, TV / AUX and chauffeur choice.</p>
                        <button onClick={() => navigate('/membership', { state: { fromTrackRide: true, paymentMethod } })} className="group flex w-full items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 py-3 text-[10px] font-black uppercase tracking-widest text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-black">
                          <Lock className="h-3.5 w-3.5" />
                          Unlock Gold perks
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {showPromo && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mx-5 mb-5 rounded-2xl border-2 border-dashed border-[#D4AF37]/40 bg-[#D4AF37]/10 p-4 text-center">
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
                <p className="text-[10px] font-black text-white uppercase italic tracking-tight">{isMember ? 'Tuxedo Gold is active' : 'Unlock Tuxedo Gold'}</p>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{isMember ? rideCreditLabel : 'Ride credit plus premium perks'}</p>
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
            <h3 className="text-3xl font-black text-[#D4AF37] mb-1">$100 Gold</h3>
            <p className="text-sm text-gray-300 font-medium mb-8">Premium perks and ride credit for your next journey.</p>
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

const GOOGLE_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#080808' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#d7d7d7' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#080808' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#2f2f2f' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#0f0f0f' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#242424' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#101010' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3a3320' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#05070b' }] },
];

type MapPoint = { lat: number; lng: number };

function geocodeAddress(address: string, fallback: MapPoint): Promise<MapPoint> {
  const googleApi = (window as any).google;
  if (!address.trim() || !googleApi?.maps?.Geocoder) return Promise.resolve(fallback);

  return new Promise((resolve) => {
    const geocoder = new googleApi.maps.Geocoder();
    geocoder.geocode({ address }, (results: any[], status: string) => {
      if (status === 'OK' && results?.[0]?.geometry?.location) {
        const location = results[0].geometry.location;
        resolve({ lat: location.lat(), lng: location.lng() });
        return;
      }
      resolve(fallback);
    });
  });
}

const GoogleTrackingMap = ({ pickup, dropoff, driverName }: { pickup: string; dropoff: string; driverName: string }) => {
  const [progress, setProgress] = React.useState(0.15);
  const [pickupPoint, setPickupPoint] = React.useState<MapPoint>(FALLBACK_PICKUP);
  const [dropoffPoint, setDropoffPoint] = React.useState<MapPoint>(FALLBACK_DROPOFF);
  const [directions, setDirections] = React.useState<any>(null);
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || '',
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => (p >= 0.88 ? 0.15 : p + 0.004));
    }, 80);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (!isLoaded || !(window as any).google) return;

    let cancelled = false;
    const googleApi = (window as any).google;

    async function loadRoute() {
      const nextPickup = await geocodeAddress(pickup, FALLBACK_PICKUP);
      const nextDropoff = await geocodeAddress(dropoff, FALLBACK_DROPOFF);
      if (cancelled) return;

      setPickupPoint(nextPickup);
      setDropoffPoint(nextDropoff);

      const directionsService = new googleApi.maps.DirectionsService();
      directionsService.route(
        {
          origin: nextPickup,
          destination: nextDropoff,
          travelMode: googleApi.maps.TravelMode.DRIVING,
        },
        (result: any, status: string) => {
          if (cancelled) return;
          setDirections(status === 'OK' ? result : null);
        },
      );
    }

    loadRoute();
    return () => {
      cancelled = true;
    };
  }, [dropoff, isLoaded, pickup]);

  if (!GOOGLE_MAPS_API_KEY || loadError || !isLoaded) {
    return <GoogleMapsEmbed pickup={pickup} dropoff={dropoff} driverName={driverName} />;
  }

  const driverPoint = {
    lat: pickupPoint.lat + (dropoffPoint.lat - pickupPoint.lat) * progress,
    lng: pickupPoint.lng + (dropoffPoint.lng - pickupPoint.lng) * progress,
  };

  return (
    <div className="rounded-2xl overflow-hidden border-2 border-[#D4AF37]/20 bg-[#0a0a0a]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
          <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Live Tracking</span>
        </div>
        <span className="text-[9px] text-[#D4AF37] font-bold uppercase">Google Map</span>
      </div>
      <div className="relative h-[220px]">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={driverPoint}
          zoom={13}
          options={{
            backgroundColor: '#050505',
            clickableIcons: false,
            disableDefaultUI: true,
            fullscreenControl: false,
            gestureHandling: 'greedy',
            keyboardShortcuts: false,
            mapTypeControl: false,
            streetViewControl: false,
            styles: GOOGLE_MAP_STYLE,
            zoomControl: true,
          }}
        >
          {directions ? (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                  strokeColor: '#D4AF37',
                  strokeOpacity: 0.95,
                  strokeWeight: 5,
                },
                suppressMarkers: true,
              }}
            />
          ) : null}
          <MarkerF position={pickupPoint} label={{ text: 'P', color: '#000', fontWeight: '900' }} />
          <MarkerF position={dropoffPoint} label={{ text: 'D', color: '#000', fontWeight: '900' }} />
          <MarkerF position={driverPoint} label={{ text: '•', color: '#000', fontWeight: '900' }} />
        </GoogleMap>
        <div className="pointer-events-none absolute bottom-2 left-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-[9px] text-gray-300 font-bold max-w-[92px] truncate">{pickup || 'Pickup'}</span>
        </div>
        <div className="pointer-events-none absolute top-2 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-[9px] text-gray-300 font-bold max-w-[92px] truncate">{dropoff || 'Dropoff'}</span>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-2 border-t border-white/5">
        <div className="flex items-center gap-2"><Car className="w-3.5 h-3.5 text-[#D4AF37]" /><span className="text-[9px] text-gray-400 font-bold">{driverName} en route</span></div>
        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" /><span className="text-[9px] text-[#D4AF37] font-black uppercase">Live</span></div>
      </div>
    </div>
  );
};

const GoogleMapsEmbed = ({ pickup, dropoff, driverName }: { pickup: string; dropoff: string; driverName: string }) => {
  const encodedPickup = encodeURIComponent(pickup || DEFAULT_US_PICKUP);
  const encodedDropoff = encodeURIComponent(dropoff || pickup || 'Ahmedabad');
  const mapSrc = `https://www.google.com/maps?output=embed&saddr=${encodedPickup}&daddr=${encodedDropoff}`;

  return (
    <div className="rounded-2xl overflow-hidden border-2 border-[#D4AF37]/20 bg-[#0a0a0a]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
          <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Live Tracking</span>
        </div>
        <span className="text-[9px] text-[#D4AF37] font-bold uppercase">Google Map</span>
      </div>
      <div className="relative h-[220px] bg-black">
        <iframe
          title="Google ride tracking map"
          src={mapSrc}
          className="h-full w-full border-0 grayscale-[0.15] invert-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div className="pointer-events-none absolute bottom-2 left-3 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 backdrop-blur">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-[9px] text-gray-100 font-bold max-w-[92px] truncate">{pickup || 'Pickup'}</span>
        </div>
        <div className="pointer-events-none absolute top-2 right-3 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 backdrop-blur">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-[9px] text-gray-100 font-bold max-w-[92px] truncate">{dropoff || 'Dropoff'}</span>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-2 border-t border-white/5">
        <div className="flex items-center gap-2"><Car className="w-3.5 h-3.5 text-[#D4AF37]" /><span className="text-[9px] text-gray-400 font-bold">{driverName} en route</span></div>
        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" /><span className="text-[9px] text-[#D4AF37] font-black uppercase">Live</span></div>
      </div>
    </div>
  );
};

