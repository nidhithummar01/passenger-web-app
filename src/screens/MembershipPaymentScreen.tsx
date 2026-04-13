import { useNavigate, useLocation } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { CreditCard, Apple, ShieldCheck, Zap, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import { motion } from 'motion/react';

export const MembershipPaymentScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useApp();

  const handlePayment = () => {
    localStorage.setItem('isMember', 'true');
    setUser((prev: User | null) => {
      if (!prev) return null;
      return { ...prev, isMember: true, rideCredit: 100 };
    });

    const state = location.state as { fromTrackRide?: boolean; paymentMethod?: string } | null;
    navigate('/driver-list', {
      state: {
        fromMembershipPurchase: true,
        paymentMethod: state?.paymentMethod || null,
      },
    });
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

          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <ShieldCheck className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
            </motion.div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Complete Payment</h2>
            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mt-1">Annual Gold Membership</p>
          </div>

          <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl p-6 mb-8 text-center">
            <p className="text-gray-400 text-[10px] font-black uppercase mb-1">Total Due</p>
            <p className="text-4xl font-black text-white">$100.00</p>
            <div className="flex items-center justify-center gap-2 mt-2 text-green-500 font-bold text-[10px] uppercase">
              <Zap className="w-3 h-3 fill-green-500" />
              Includes $100 Ride Credit
            </div>
          </div>

          <div className="space-y-3 mb-8">
            {[
              { id: 'apple', label: 'Apple Pay', icon: Apple },
              { id: 'card', label: 'Credit Card', icon: CreditCard },
            ].map((method) => (
              <button
                key={method.id}
                onClick={handlePayment}
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
            Membership unlocks full driver profiles and amenities.
          </p>
        </GlassCard>
      </div>
    </div>
  );
};
