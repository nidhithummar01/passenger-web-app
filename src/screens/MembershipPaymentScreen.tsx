import { useNavigate, useLocation } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { CreditCard, Apple, ShieldCheck, Zap, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import { motion } from 'motion/react';
import { TuxedoLogo } from '../components/TuxedoLogo';

const LS_SAVED_PAYMENT_METHOD = 'tuxedoSavedPaymentMethod';

export const MembershipPaymentScreen = () => {
  const navigate = useNavigate();
  const { setUser, setActiveRide } = useApp();

  const handlePayment = (method: string) => {
    localStorage.setItem('isMember', 'true');
    localStorage.setItem(LS_SAVED_PAYMENT_METHOD, method);
    setUser((prev: User | null) => {
      if (!prev) return null;
      return { ...prev, isMember: true, rideCredit: 100, savedPaymentMethod: method };
    });

    setActiveRide(null);
    navigate('/track-ride', { replace: true, state: null });
  };

  return (
    <div className="min-h-screen p-4 bg-black flex items-center justify-center">
      <div className="max-w-md w-full">
        <GlassCard className="p-8 border-[#D4AF37]/30 shadow-2xl shadow-[#D4AF37]/5">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 text-base text-[#D4AF37] hover:text-[#B8962A] flex items-center gap-2 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <TuxedoLogo className="mx-auto mb-7 h-10 w-auto" />

          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <ShieldCheck className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
            </motion.div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Complete Payment</h2>
            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mt-1">Gold membership · monthly</p>
          </div>

          <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl p-6 mb-8 text-center">
            <p className="text-gray-400 text-[10px] font-black uppercase mb-1">Due today</p>
            <p className="text-4xl font-black text-white">$100.00</p>
            <div className="flex flex-col items-center justify-center gap-1 mt-2 text-green-500 font-bold text-[10px] uppercase">
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 fill-green-500" />
                <span>$100 toward your next ride</span>
              </div>
              <span className="text-[9px] text-gray-500 font-medium normal-case">Monthly credit does not stack</span>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            {[
              { id: 'apple', label: 'Apple Pay', icon: Apple },
              { id: 'card', label: 'Credit Card', icon: CreditCard },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => handlePayment(method.label)}
                className="w-full p-5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between hover:border-[#D4AF37] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <method.icon className="text-[#D4AF37] w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-white">{method.label}</span>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-[#D4AF37]/30 group-hover:border-[#D4AF37]" />
              </button>
            ))}
          </div>

          <p className="text-[10px] text-gray-600 text-center uppercase font-black px-4 leading-relaxed italic">
            Secure payment processed by Tuxedo Financial. <br />
            Membership includes advanced chauffeur filters and full profiles in the app.
          </p>
        </GlassCard>
      </div>
    </div>
  );
};
