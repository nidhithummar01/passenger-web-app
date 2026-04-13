import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { GlassCard, GoldButton } from '../components/GlassCard';
import { motion, AnimatePresence } from 'motion/react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['SU','MO','TU','WE','TH','FR','SA'];
const HOURS = ['01','02','03','04','05','06','07','08','09','10','11','12'];
const MINUTES = ['00','15','30','45'];

export const ReserveRideScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pickupLocation = (location.state as any)?.pickupLocation || 'The Grand Majestic Hotel';

  const today = new Date();
  const [showCalendar, setShowCalendar] = useState(false);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState('09');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');

  const hourRef = React.useRef<HTMLDivElement>(null);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const formatSelectedDate = (d: Date) =>
    d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const timeDisplay = `${selectedHour}:${selectedMinute} ${ampm}`;

  const canConfirm = selectedDate !== null;

  const handleConfirm = () => {
    navigate('/track-ride', {
      state: {
        reservedDate: selectedDate?.toISOString(),
        reservedTime: timeDisplay,
        pickupLocation,
      },
    });
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const firstDay = getFirstDayOfMonth(calYear, calMonth);
    const cells: React.ReactElement[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} />);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(calYear, calMonth, d);
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      const isToday = date.toDateString() === today.toDateString();
      cells.push(
        <button
          key={d}
          disabled={isPast}
          onClick={() => { setSelectedDate(date); setShowCalendar(false); }}
          className={`w-9 h-9 rounded-xl text-sm font-bold transition-all flex items-center justify-center
            ${isPast ? 'text-gray-700 cursor-not-allowed' : 'hover:bg-[#D4AF37]/20'}
            ${isSelected ? 'bg-[#D4AF37] text-black' : ''}
            ${isToday && !isSelected ? 'border border-[#D4AF37] text-[#D4AF37]' : ''}
            ${!isSelected && !isToday && !isPast ? 'text-white' : ''}
          `}
        >
          {d}
        </button>
      );
    }
    return cells;
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-32">
      <div className="max-w-md mx-auto px-4 pt-8">
        {/* Header */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#D4AF37] font-bold mb-6">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-[#D4AF37]/20 rounded-2xl flex items-center justify-center border border-[#D4AF37]/30">
            <Calendar className="w-7 h-7 text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase italic">Reserve a Ride</h1>
            <p className="text-xs text-gray-500 font-medium">Schedule your chauffeur in advance</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Pickup */}
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Pickup Location</span>
            </div>
            <p className="text-base font-bold text-white">{pickupLocation}</p>
          </GlassCard>

          {/* Date Picker */}
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Select Date</span>
            </div>
            <button
              onClick={() => setShowCalendar(true)}
              className="w-full flex items-center gap-3 p-4 bg-black/50 border-2 border-[#D4AF37]/20 rounded-xl hover:border-[#D4AF37]/50 transition-all"
            >
              <Calendar className="w-5 h-5 text-gray-500" />
              {selectedDate ? (
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-white">{formatSelectedDate(selectedDate)}</span>
                  <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                </div>
              ) : (
                <span className="text-gray-500 font-medium">Tap to choose a date</span>
              )}
            </button>
          </GlassCard>

          {/* Time Picker */}
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Select Time</span>
            </div>

            {/* Time Display */}
            <p className="text-4xl font-black text-[#D4AF37] text-center mb-6 tracking-tight">
              {selectedHour}:{selectedMinute} {ampm}
            </p>

            {/* Hour scroll */}
            <div ref={hourRef} className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-1">
              {HOURS.map(h => (
                <button
                  key={h}
                  onClick={() => setSelectedHour(h)}
                  className={`min-w-[52px] h-12 rounded-xl text-sm font-bold transition-all flex-shrink-0
                    ${selectedHour === h ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}
                >
                  {h}
                </button>
              ))}
            </div>

            <div className="text-center text-[#D4AF37] font-black text-lg my-2">:</div>

            {/* Minute selector */}
            <div className="flex gap-2 mb-4">
              {MINUTES.map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMinute(m)}
                  className={`flex-1 h-12 rounded-xl text-sm font-bold transition-all
                    ${selectedMinute === m ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* AM/PM */}
            <div className="grid grid-cols-2 gap-2">
              {(['AM', 'PM'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setAmpm(p)}
                  className={`py-3 rounded-xl font-black text-sm transition-all
                    ${ampm === p ? 'bg-[#D4AF37]/20 border-2 border-[#D4AF37] text-[#D4AF37]' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Booking Summary */}
          {selectedDate && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard className="p-4 border-[#D4AF37]/30">
                <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest text-center mb-4">Booking Summary</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-sm text-white font-medium">{formatSelectedDate(selectedDate)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-sm text-white font-medium">{timeDisplay}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-sm text-white font-medium">{pickupLocation}</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>

      {/* Confirm Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-sm border-t border-white/5">
        <div className="max-w-md mx-auto">
          <GoldButton onClick={handleConfirm} disabled={!canConfirm} className="w-full py-5 text-base font-black uppercase">
            Confirm Reservation
          </GoldButton>
        </div>
      </div>

      {/* Calendar Modal */}
      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowCalendar(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-[#0d0d0d] border-2 border-[#D4AF37]/30 rounded-2xl p-5"
            >
              {/* Month nav */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="w-9 h-9 bg-[#D4AF37]/20 rounded-xl flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37]/30 transition-all">
                  ‹
                </button>
                <span className="font-black text-white uppercase tracking-widest text-sm">
                  {MONTHS[calMonth]} {calYear}
                </span>
                <button onClick={nextMonth} className="w-9 h-9 bg-[#D4AF37]/20 rounded-xl flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37]/30 transition-all">
                  ›
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-[10px] font-black text-gray-600 uppercase py-1">{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-y-1">
                {renderCalendar()}
              </div>

              <button
                onClick={() => setShowCalendar(false)}
                className="w-full mt-4 py-2 text-sm font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
