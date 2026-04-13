import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard, GoldButton } from '../components/GlassCard';
import { mockDrivers, Driver } from '../data/mockDrivers';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft, Star, MapPin, Clock, Shield, Car, User,
  SlidersHorizontal, Lock, Wallet, Info
} from 'lucide-react';

type FlowState = { fromTrackRide?: boolean; paymentMethod?: string | null };

const toTrackRideState = (flow: FlowState | null, driver: Driver) => ({
  fromMembershipPurchase: true,
  paymentMethod: flow?.paymentMethod ?? null,
  selectedDriver: driver,
});

export const DriverListScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const flow = location.state as FlowState | null;
  const { user } = useApp();
  const isMember = localStorage.getItem('isMember') === 'true' || user?.isMember === true;
  const [drivers] = useState<Driver[]>(mockDrivers);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ hotelPreferred: false, verified: true, minRating: 4.5, maxDistance: 5 });

  const filteredDrivers = drivers.filter(d => {
    if (filters.hotelPreferred && !d.hotelPreferred) return false;
    if (filters.verified && !d.verified) return false;
    if (d.rating < filters.minRating) return false;
    if (d.distance > filters.maxDistance) return false;
    return true;
  });

  return (
    <div className="min-h-screen p-4 bg-black">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            onClick={() => navigate(-1)}
            className="text-base text-[#D4AF37] hover:text-[#B8962A] flex items-center gap-2 font-semibold"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </motion.button>

          {isMember && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30">
              <Wallet className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[10px] text-white font-black uppercase tracking-widest">Credit: ${user?.rideCredit?.toFixed(2)}</span>
            </motion.div>
          )}

          <motion.button
            onClick={() => isMember ? setShowFilters(!showFilters) : navigate('/membership')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/60 border-2 border-[#D4AF37]/30 hover:border-[#D4AF37]/50 text-[#D4AF37] font-bold transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isMember ? <SlidersHorizontal className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
            <span className="text-sm">{isMember ? 'Filters' : 'Unlock Filters'}</span>
          </motion.button>
        </div>

        <GlassCard className="p-8 mb-4">
          <motion.h2 className="text-2xl mb-3 text-white font-bold uppercase italic tracking-tight">Available Chauffeurs</motion.h2>
          <p className="text-base text-gray-400 font-medium mb-6">
            {filteredDrivers.length} driver{filteredDrivers.length !== 1 ? 's' : ''} found for your schedule
          </p>

          {/* Filters panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="mb-6 p-5 bg-black/60 rounded-xl border-2 border-[#D4AF37]/20 overflow-hidden"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <h3 className="text-base font-bold text-white mb-4">Search Filters</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={filters.hotelPreferred} onChange={e => setFilters({ ...filters, hotelPreferred: e.target.checked })} className="w-5 h-5 accent-[#D4AF37]" />
                    <span className="text-sm text-white font-medium">Hotel Preferred Only</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={filters.verified} onChange={e => setFilters({ ...filters, verified: e.target.checked })} className="w-5 h-5 accent-[#D4AF37]" />
                    <span className="text-sm text-white font-medium">Verified Only</span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Driver cards */}
          <div className="space-y-4">
            {filteredDrivers.map((driver, index) => (
              <motion.div key={driver.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <GlassCard className="p-5 border-white/5 relative overflow-hidden group">
                  <div className="flex items-center gap-5">
                    {/* Avatar + Car icon */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-[#D4AF37]/30 flex items-center justify-center overflow-hidden">
                          <User className="text-gray-600 w-10 h-10" />
                        </div>
                        {driver.verified && (
                          <div className="absolute -bottom-1 -right-1 bg-[#D4AF37] rounded-full p-1 border-2 border-black">
                            <Shield className="w-3 h-3 text-black" />
                          </div>
                        )}
                      </div>
                      <div className="w-24 h-14 bg-white/5 rounded-xl flex items-center justify-center p-2 border border-white/10">
                        <Car className="text-[#D4AF37] w-8 h-8 opacity-40 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>

                    {/* Driver info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg text-white font-bold">{driver.name.split(' ')[0]} {driver.name.split(' ')[1]?.[0]}.</h3>
                        <div className="flex items-center gap-1 text-[#D4AF37] font-bold text-sm">
                          <Star className="w-4 h-4 fill-[#D4AF37]" /> {driver.rating}
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm font-medium">{driver.vehicle.brand} {driver.vehicle.model}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-gray-500 flex items-center gap-1 uppercase tracking-widest font-bold">
                          <MapPin className="w-3 h-3" /> {driver.distance} miles
                        </span>
                        <span className="text-[10px] text-[#D4AF37] flex items-center gap-1 uppercase tracking-widest font-bold">
                          <Clock className="w-3 h-3" /> {driver.eta} mins
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => navigate('/driver-profile', { state: { driver, fromTrackRide: true, paymentMethod: flow?.paymentMethod ?? null } })}
                      className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                    >
                      <Info className="w-4 h-4" /> View Profile
                    </button>
                    <GoldButton
                      onClick={() => navigate('/track-ride', { state: toTrackRideState(flow, driver) })}
                      className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest"
                    >
                      Select Chauffeur
                    </GoldButton>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
