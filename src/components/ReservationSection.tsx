import React, { useState } from 'react';
import { Calendar, Clock, Users, Coffee, Cat, CheckCircle, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { MenuItem } from '../data/defaultData';
import { useToast } from './Toast';

interface ReservationSectionProps {
  preselectedItems?: { item: MenuItem; quantity: number }[];
  onClearPreselected?: () => void;
}

export const ReservationSection: React.FC<ReservationSectionProps> = ({
  preselectedItems = [],
  onClearPreselected,
}) => {
  const { showToast } = useToast();

  const [bookingType, setBookingType] = useState<'Cat Lounge & Coffee' | 'Cafe Dining Only' | 'Takeaway Pick-up'>('Cat Lounge & Coffee');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
    time: '14:00',
    guests: '2',
    includeKittyTreats: false,
    specialNotes: '',
  });

  const [confirmedBooking, setConfirmedBooking] = useState<{
    id: string;
    name: string;
    date: string;
    time: string;
    guests: string;
    type: string;
    totalBill: number;
  } | null>(null);

  const preselectedTotal = preselectedItems.reduce(
    (sum, cur) => sum + cur.item.price * cur.quantity,
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      showToast('Please enter your name and contact phone number', 'error');
      return;
    }

    const bookingId = 'PHB-' + Math.floor(1000 + Math.random() * 9000);
    const catLoungeEntryFee = bookingType === 'Cat Lounge & Coffee' ? parseInt(formData.guests) * 15 : 0;
    const treatsFee = formData.includeKittyTreats ? 15 : 0;
    const finalTotal = preselectedTotal + catLoungeEntryFee + treatsFee;

    setConfirmedBooking({
      id: bookingId,
      name: formData.name,
      date: formData.date,
      time: formData.time,
      guests: formData.guests,
      type: bookingType,
      totalBill: finalTotal,
    });

    showToast(`Table booked successfully! Reference code: ${bookingId}`, 'success');
  };

  const resetForm = () => {
    setConfirmedBooking(null);
    if (onClearPreselected) onClearPreselected();
  };

  return (
    <section id="reservations" className="py-16 sm:py-24 bg-[#F8F5EE] border-t border-[#E8E2D5]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold tracking-widest text-[#5A7A6B] uppercase mb-1 flex items-center justify-center gap-1.5">
            <Coffee className="w-3.5 h-3.5 text-[#7A9A8B]" /> Dine-In & Cat Lounge
          </div>
          <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#2D3142] tracking-tight">
            Reserve Your Visit or Order Ahead
          </h2>
          <p className="text-sm sm:text-base text-[#2D3142]/75 mt-2">
            To maintain a tranquil, stress-free haven for our rescued furkids, we cap cat lounge visitors per hour.
            Clean socks are required to enter the cat cuddle room.
          </p>
        </div>

        {confirmedBooking ? (
          /* Confirmation Success View */
          <div className="bg-[#FFFDF8] rounded-3xl p-6 sm:p-10 border border-[#7A9A8B] shadow-md animate-in fade-in zoom-in-95 duration-300">
            <div className="max-w-xl mx-auto text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-[#5A7A6B] tracking-wider uppercase">
                  Reservation Confirmed
                </span>
                <h3 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#2D3142] mt-1">
                  We'll See You Soon, {confirmedBooking.name}!
                </h3>
              </div>

              {/* Booking Voucher Card */}
              <div className="bg-[#F8F5EE] rounded-2xl p-5 border border-[#E8E2D5] text-left space-y-3 font-sans">
                <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3">
                  <span className="text-xs text-[#2D3142]/60">Booking Reference</span>
                  <span className="font-mono font-bold text-[#E07A5F] text-base">
                    {confirmedBooking.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#2D3142]/60 block">Date & Time:</span>
                    <span className="font-semibold text-[#2D3142]">
                      {confirmedBooking.date} at {confirmedBooking.time}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#2D3142]/60 block">Experience:</span>
                    <span className="font-semibold text-[#2D3142]">
                      {confirmedBooking.type}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#2D3142]/60 block">Party Size:</span>
                    <span className="font-semibold text-[#2D3142]">
                      {confirmedBooking.guests} Guests
                    </span>
                  </div>
                  <div>
                    <span className="text-[#2D3142]/60 block">Estimated Bill:</span>
                    <span className="font-bold text-[#2D3142] font-mono">
                      RM {confirmedBooking.totalBill.toFixed(2)}
                    </span>
                  </div>
                </div>

                {preselectedItems.length > 0 && (
                  <div className="border-t border-[#E8E2D5] pt-3 text-xs">
                    <span className="font-semibold text-[#2D3142] block mb-1">Pre-ordered Items:</span>
                    <div className="space-y-1">
                      {preselectedItems.map((p) => (
                        <div key={p.item.id} className="flex justify-between text-[#2D3142]/80">
                          <span>{p.quantity}x {p.item.name}</span>
                          <span className="font-mono">RM {(p.item.price * p.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Cafe Rules Reminders */}
              <div className="text-xs text-left bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-amber-950">
                  <ShieldCheck className="w-4 h-4 text-amber-700" /> Cat Lounge House Rules:
                </span>
                <p>• Clean socks are mandatory in the indoor cat room (available for RM 3 at the counter if needed).</p>
                <p>• Do not pick up sleeping cats or feed outside food to our furkids.</p>
                <p>• Payment can be settled via DuitNow QR, Touch 'n Go, Cash, or Card upon arrival.</p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={resetForm}
                  className="px-6 py-2.5 rounded-xl bg-[#2D3142] text-white text-xs font-semibold hover:bg-[#1e212b] transition-all cursor-pointer"
                >
                  Make Another Reservation
                </button>
              </div>

            </div>
          </div>
        ) : (
          /* Booking Form */
          <div className="bg-[#FFFDF8] rounded-3xl p-6 sm:p-10 border border-[#E8E2D5] shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Experience Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D3142] mb-2.5">
                  Select Experience Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'Cat Lounge & Coffee',
                      label: 'Cat Lounge Cuddle',
                      desc: '60 min play & cuddle with rescue cats + cafe drinks',
                      icon: Cat,
                    },
                    {
                      id: 'Cafe Dining Only',
                      label: 'Cafe Dining Table',
                      desc: 'Sourdough, pastas & artisan coffee outside lounge glass',
                      icon: Coffee,
                    },
                    {
                      id: 'Takeaway Pick-up',
                      label: 'Takeaway Order',
                      desc: 'Fast express pick-up for pastries & bottled brews',
                      icon: Clock,
                    },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = bookingType === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setBookingType(opt.id as any)}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#E07A5F] bg-[#E07A5F]/5 shadow-xs'
                            : 'border-[#E8E2D5] bg-[#FFFDF8] hover:border-[#7A9A8B]/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-[#E07A5F]' : 'text-[#7A9A8B]'}`} />
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-[#E07A5F] bg-[#E07A5F]' : 'border-[#D4CFBD]'
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                          </span>
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[#2D3142]">{opt.label}</div>
                          <div className="text-[11px] text-[#2D3142]/70 mt-1 leading-snug">
                            {opt.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preselected Tray Items Alert if any */}
              {preselectedItems.length > 0 && (
                <div className="p-4 bg-[#F2ECE1] rounded-2xl border border-[#E4DC CE] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#2D3142] block">
                      Attached {preselectedItems.length} Pre-ordered Menu Items:
                    </span>
                    <span className="text-xs text-[#2D3142]/70">
                      Subtotal: RM {preselectedTotal.toFixed(2)} (prepared fresh for your arrival)
                    </span>
                  </div>
                  {onClearPreselected && (
                    <button
                      type="button"
                      onClick={onClearPreselected}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800 underline"
                    >
                      Clear Items
                    </button>
                  )}
                </div>
              )}

              {/* Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2D3142] mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nur Aina / Jason Tan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FFFDF8] text-sm text-[#2D3142] focus:outline-hidden focus:border-[#7A9A8B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D3142] mb-1.5">
                    WhatsApp / Phone (+60) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 012-345 6789"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FFFDF8] text-sm text-[#2D3142] focus:outline-hidden focus:border-[#7A9A8B]"
                  />
                </div>
              </div>

              {/* Date, Time, Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2D3142] mb-1.5">
                    Reservation Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FFFDF8] text-sm text-[#2D3142] focus:outline-hidden focus:border-[#7A9A8B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D3142] mb-1.5">
                    Time Slot *
                  </label>
                  <select
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FFFDF8] text-sm text-[#2D3142] focus:outline-hidden focus:border-[#7A9A8B]"
                  >
                    <option value="11:00">11:00 AM (Morning Play)</option>
                    <option value="12:30">12:30 PM (Lunch & Cuddle)</option>
                    <option value="14:00">02:00 PM (Afternoon Naptime)</option>
                    <option value="15:30">03:30 PM (Tea & Treats)</option>
                    <option value="17:00">05:00 PM (Evening Active Hour)</option>
                    <option value="18:30">06:30 PM (Dinner & Cuddle)</option>
                    <option value="20:00">08:00 PM (Quiet Night Session)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D3142] mb-1.5">
                    Number of Guests *
                  </label>
                  <select
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FFFDF8] text-sm text-[#2D3142] focus:outline-hidden focus:border-[#7A9A8B]"
                  >
                    <option value="1">1 Person (Solo Cuddles)</option>
                    <option value="2">2 Persons</option>
                    <option value="3">3 Persons</option>
                    <option value="4">4 Persons</option>
                    <option value="5">5 Persons</option>
                    <option value="6">6+ Persons (Group)</option>
                  </select>
                </div>
              </div>

              {/* Add-on Cat Treats Checkbox */}
              {bookingType === 'Cat Lounge & Coffee' && (
                <div className="p-4 rounded-2xl bg-[#F9F6F0] border border-[#E8E2D5] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="treats"
                      checked={formData.includeKittyTreats}
                      onChange={(e) => setFormData({ ...formData, includeKittyTreats: e.target.checked })}
                      className="w-4 h-4 text-[#E07A5F] rounded-md focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="treats" className="text-xs text-[#2D3142] cursor-pointer">
                      <strong className="block font-bold">Add Kitty Treat Starter Kit (+RM 15.00)</strong>
                      <span className="text-[#2D3142]/70">
                        Includes pure freeze-dried salmon bites and a lickable churu stick to hand-feed rescue cats!
                      </span>
                    </label>
                  </div>
                  <Sparkles className="w-5 h-5 text-[#E07A5F] shrink-0 hidden sm:block" />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-[#2D3142] mb-1.5">
                  Special Notes or Allergies (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Birthday celebration, prefer quiet corner, lactose intolerance..."
                  value={formData.specialNotes}
                  onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FFFDF8] text-sm text-[#2D3142] focus:outline-hidden focus:border-[#7A9A8B]"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-2xl bg-[#E07A5F] hover:bg-[#C9664C] text-white font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-lg active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Confirm Table Reservation / Order
                </button>
                <p className="text-[11px] text-[#2D3142]/60 text-center mt-2">
                  No advance deposit required for general slots. Instant WhatsApp confirmation sent.
                </p>
              </div>

            </form>
          </div>
        )}

      </div>
    </section>
  );
};
