import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { GlassCard, GoldButton } from '../components/GlassCard';
import { CheckCircle2, Crown, ArrowLeft, Zap } from 'lucide-react';

export const MembershipScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const flowState = location.state as { fromTrackRide?: boolean; paymentMethod?: string } | null;
  const cameFromTrackRide = flowState?.fromTrackRide === true;

  const benefits = [
    '24-hour on-demand concierge (dedicated line)',
    'Advanced chauffeur filters',
    'Full chauffeur profiles',
    'Priority dispatching',
  ];

  return (
    <div className="min-h-screen p-4 bg-black">
      <div className="max-w-md mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="text-[#D4AF37] flex items-center gap-2 font-bold mb-4">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <GlassCard className="p-8 text-center border-[#D4AF37]/30">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mb-6">
            <Crown className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
            <h1 className="text-3xl font-black text-white uppercase italic">Tuxedo Gold</h1>
          </motion.div>

          <div className="bg-[#D4AF37]/10 p-6 rounded-2xl border border-[#D4AF37]/20 mb-8">
            <p className="text-xs font-black text-[#D4AF37] uppercase tracking-widest mb-1">Membership</p>
            <p className="text-5xl font-black text-[#D4AF37]">$100</p>
            <p className="text-sm text-gray-400 font-semibold mt-1">per month · auto-billing</p>
            <div className="mt-4 flex flex-col items-center justify-center gap-1 text-green-500 font-bold text-xs uppercase">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 fill-green-500" />
                <span>Get $100 toward your next ride</span>
              </div>
              <span className="text-[10px] text-gray-500 font-medium normal-case">Credit does not roll month to month</span>
            </div>
          </div>

          <div className="space-y-4 text-left mb-10">
            {benefits.map((benefit, i) => (
              <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-sm text-gray-300 font-medium">{benefit}</span>
              </motion.div>
            ))}
          </div>

          <GoldButton
            onClick={() => navigate('/membership-payment', { state: location.state })}
            className="w-full py-5 text-xl font-black uppercase"
          >
            Buy membership
          </GoldButton>

          {cameFromTrackRide && (
            <button
              onClick={() =>
                navigate('/track-ride', {
                  state: {
                    fromMembershipSkip: true,
                    paymentMethod: flowState?.paymentMethod || null,
                  },
                })
              }
              className="w-full mt-3 py-3 text-sm font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
            >
              Continue without membership
            </button>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
