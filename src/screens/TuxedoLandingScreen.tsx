import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Star, Shield, Sparkles, Crown, User } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../components/GlassCard';

export const TuxedoLandingScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { paymentMethod?: string } | null;

  const features = [
    { icon: Star, title: 'Top-Rated Drivers', sub: 'Only 4.8★ and above' },
    { icon: Shield, title: 'Fully Vetted', sub: 'Background checked' },
    { icon: Sparkles, title: 'Premium Fleet', sub: 'Luxury vehicles only' },
    { icon: Crown, title: '$100 Credit', sub: 'On membership sign-up' },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-10">
      <div className="max-w-md mx-auto px-4 pt-8">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#D4AF37] font-bold mb-8"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        {/* Hero */}
        <motion.div
          className="flex flex-col items-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 rounded-full bg-[#D4AF37]/20 border-2 border-[#D4AF37]/40 flex items-center justify-center mb-5">
            <Crown className="w-10 h-10 text-[#D4AF37]" />
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tight mb-1">Tuxedo</h1>
          <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em]">Premium Chauffeur Service</p>
        </motion.div>

        {/* Manual Chauffeur Selection CTA */}
        <motion.button
          onClick={() => navigate('/membership', { state: { fromTrackRide: true, paymentMethod: state?.paymentMethod } })}
          className="w-full flex items-center gap-4 p-5 bg-[#D4AF37] rounded-2xl mb-8 text-left hover:bg-[#B8962A] transition-all"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-12 h-12 bg-black/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-black" />
          </div>
          <div className="flex-1">
            <p className="text-base font-black text-black uppercase tracking-tight">Manual Chauffeur Selection</p>
            <p className="text-xs text-black/70 font-medium mt-0.5">Hand-pick your chauffeur from our curated fleet of professionals</p>
          </div>
          <ChevronRight className="w-5 h-5 text-black flex-shrink-0" />
        </motion.button>

        {/* Why Choose Tuxedo */}
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] text-center mb-4">Why Choose Tuxedo</p>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {features.map(({ icon: Icon, title, sub }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.07 }}
            >
              <GlassCard className="p-5" animate={false}>
                <div className="w-10 h-10 bg-[#D4AF37]/15 rounded-xl flex items-center justify-center mb-3 border border-[#D4AF37]/20">
                  <Icon className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <p className="text-sm font-black text-white mb-1">{title}</p>
                <p className="text-[10px] text-gray-500 font-medium">{sub}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Membership Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <GlassCard className="p-6 border-[#D4AF37]/30" animate={false}>
            <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.25em] text-center mb-3">Tuxedo Gold Membership</p>
            <div className="text-center mb-3">
              <span className="text-5xl font-black text-white">$100</span>
              <span className="text-base text-gray-400 font-medium"> / one-time</span>
            </div>
            <p className="text-sm text-gray-400 text-center font-medium mb-5">
              Get $100 ride credit instantly upon joining
            </p>
            <button
              onClick={() => navigate('/membership', { state: { fromTrackRide: true, paymentMethod: state?.paymentMethod } })}
              className="w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 border-[#D4AF37]/40 text-[#D4AF37] font-black text-sm hover:bg-[#D4AF37]/10 transition-all"
            >
              <span>View Membership Details</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};
