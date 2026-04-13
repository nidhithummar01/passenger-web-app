import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { GlassCard, GoldButton } from '../components/GlassCard';
import { mockDrivers, Driver } from '../data/mockDrivers';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft, Shield, Car, Sparkles, Wifi, Music, Lock, Wallet
} from 'lucide-react';

const toTrackRideState = (flow: { fromTrackRide?: boolean; paymentMethod?: string | null } | null, driver: Driver) => ({
  fromMembershipPurchase: true,
  paymentMethod: flow?.paymentMethod ?? null,
  selectedDriver: driver,
});

export const DriverProfileScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useApp();
  const isMember = localStorage.getItem('isMember') === 'true' || user?.isMember === true;
  const state = location.state as { driver?: Driver; fromTrackRide?: boolean; paymentMethod?: string | null } | null;
  const driver = state?.driver ?? mockDrivers[0];

  return (
    <div className="min-h-screen p-4 bg-black">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            onClick={() => navigate(-1)}
            className="text-[#D4AF37] flex items-center gap-2 font-semibold"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </motion.button>
          {isMember && (
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-black uppercase">
              <Wallet className="w-3.5 h-3.5" /> ${user?.rideCredit?.toFixed(2)} Credit
            </div>
          )}
        </div>

        <GlassCard className="p-8">
          {/* Avatar + name + stats */}
          <motion.div className="text-center mb-8" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-black/50 border-4 border-[#D4AF37]/40 flex items-center justify-center overflow-hidden">
                <span className="text-6xl text-[#D4AF37] font-black">{driver.name.charAt(0)}</span>
              </div>
              {driver.verified && (
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center border-4 border-black">
                  <Shield className="w-6 h-6 text-black" />
                </div>
              )}
            </div>
            <h1 className="text-3xl font-black text-white mb-2">
              {driver.name.split(' ')[0]} {driver.name.split(' ')[1]?.[0]}.
            </h1>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="text-center">
                <p className="text-2xl text-[#D4AF37] font-bold">{driver.rating}</p>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">Rating</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <p className="text-2xl text-white font-bold">{driver.experience}</p>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">Years Exp</p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            {/* Vehicle Details */}
            <div className="p-6 bg-black/40 rounded-2xl border-2 border-[#D4AF37]/20">
              <h3 className="text-xs font-black text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                <Car className="w-4 h-4 text-[#D4AF37]" /> Vehicle Details
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-black">Make/Model</p>
                  <p className="text-white font-bold text-sm">{driver.vehicle.brand} {driver.vehicle.model}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-black">Plate</p>
                  <p className="text-white font-bold text-sm">{driver.vehicle.plate}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-black">Year</p>
                  <p className="text-white font-bold text-sm">{driver.vehicle.year}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-black">Interior</p>
                  <p className="text-white font-bold text-sm">{driver.vehicle.interior}</p>
                </div>
              </div>
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Amenities — gated by membership */}
              {isMember ? (
                <div className="p-6 bg-black/40 rounded-2xl border-2 border-[#D4AF37]/20">
                  <h3 className="text-xs font-black text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Premium Amenities
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {driver.amenities.wifi && (
                      <div className="p-3 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/20 flex items-center gap-2 text-xs text-white font-bold">
                        <Wifi className="w-3.5 h-3.5 text-[#D4AF37]" /> WiFi
                      </div>
                    )}
                    {driver.amenities.music && (
                      <div className="p-3 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/20 flex items-center gap-2 text-xs text-white font-bold">
                        <Music className="w-3.5 h-3.5 text-[#D4AF37]" /> Audio
                      </div>
                    )}
                    {driver.amenities.childSeat && (
                      <div className="p-3 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/20 flex items-center gap-2 text-xs text-white font-bold">
                        <Shield className="w-3.5 h-3.5 text-[#D4AF37]" /> Child Seat
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-[#D4AF37]/5 rounded-3xl border-2 border-dashed border-[#D4AF37]/30">
                  <Lock className="w-10 h-10 text-[#D4AF37] mx-auto mb-3" />
                  <p className="text-xs text-white font-black uppercase mb-1">Premium Amenities Locked</p>
                  <button
                    onClick={() => navigate('/membership')}
                    className="text-[10px] text-[#D4AF37] underline uppercase font-black"
                  >
                    Join Membership to View
                  </button>
                </div>
              )}

              <p className="text-gray-400 text-xs leading-relaxed italic">
                "Professional chauffeur providing a seamless luxury experience. Certified for executive protection and concierge-level service."
              </p>

              <GoldButton
                onClick={() => navigate('/track-ride', { state: toTrackRideState(state, driver) })}
                className="w-full py-5 text-lg uppercase font-black"
              >
                Assign This Chauffeur
              </GoldButton>
            </motion.div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
