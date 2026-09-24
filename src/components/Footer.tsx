import React, { useState } from 'react';
import { Cat, Heart, Coffee, ShieldCheck, MapPin, Clock, Phone, Sparkles, Lock } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenDonation: () => void;
  onOpenReservation: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdmin,
  onOpenDonation,
  onOpenReservation,
}) => {
  const [logoClicks, setLogoClicks] = useState(0);

  const handleLogoClick = () => {
    const next = logoClicks + 1;
    if (next >= 3) {
      setLogoClicks(0);
      onOpenAdmin();
    } else {
      setLogoClicks(next);
      setTimeout(() => setLogoClicks(0), 1500);
    }
  };

  return (
    <footer className="bg-[#262A38] text-white pt-16 pb-12 border-t border-[#1C1F2A] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand & Mission (Col 1 - 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div
              className="flex items-center gap-3 cursor-pointer select-none group"
              onClick={handleLogoClick}
              title="Triple click for founder admin access"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#E07A5F] flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <Cat className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif-title font-bold text-2xl tracking-tight block">
                  Pherbies Cafe
                </span>
                <span className="text-[11px] text-[#7A9A8B] font-bold uppercase tracking-widest block">
                  Cat Rescue & Artisan Brews
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Malaysia's heartfelt community cafe where every warm cup and fresh pastry directly finances life-saving surgeries, monthly TNR (Trap-Neuter-Return) operations, quality food, and medical sanctuary for ~8 resident rescues and neighborhood strays.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://www.threads.net/@pherbiescafe"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-stone-200 hover:text-white transition-all"
              >
                <span className="font-mono font-bold text-sm">@</span>
                Follow on Threads
              </a>

              <button
                onClick={onOpenDonation}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#C9664C] text-xs font-semibold text-white transition-all shadow-xs"
              >
                <Heart className="w-3.5 h-3.5 fill-white/20" />
                Donate Fund
              </button>
            </div>
          </div>

          {/* Location & Opening Hours (Col 5 - 7) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif-title font-bold text-base text-white">
              Hours & Location
            </h4>

            <div className="space-y-2 text-xs text-stone-300">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#7A9A8B] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Tuesday – Sunday</div>
                  <div>10:00 AM – 9:00 PM</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    (Closed Mondays for veterinary clinic runs & deep sanitation)
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2">
                <MapPin className="w-4 h-4 text-[#E07A5F] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Klang Valley Sanctuary</div>
                  <div>Petaling Jaya / Bangsar vicinity</div>
                  <div>Selangor, Malaysia</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation Links (Col 8 - 9) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif-title font-bold text-base text-white">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <a href="#impact-tracker" className="hover:text-[#E07A5F] transition-colors">
                  Impact Tracker
                </a>
              </li>
              <li>
                <a href="#cats-gallery" className="hover:text-[#E07A5F] transition-colors">
                  Resident Rescues
                </a>
              </li>
              <li>
                <a href="#cafe-menu" className="hover:text-[#E07A5F] transition-colors">
                  Artisan Menu
                </a>
              </li>
              <li>
                <a href="#tnr-log" className="hover:text-[#E07A5F] transition-colors">
                  TNR Operations
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenReservation}
                  className="hover:text-[#E07A5F] transition-colors text-left"
                >
                  Table Reservation
                </button>
              </li>
            </ul>
          </div>

          {/* Cat Cafe Etiquette (Col 10 - 12) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif-title font-bold text-base text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#7A9A8B]" /> Furkid Etiquette
            </h4>
            <div className="text-xs text-stone-300 space-y-1.5 bg-white/5 p-3.5 rounded-2xl border border-white/5">
              <p>🧦 <strong>Socks mandatory</strong> inside cat play lounge.</p>
              <p>🤫 Keep indoor voices tranquil to prevent stress.</p>
              <p>💤 Let sleeping cats rest uninterrupted.</p>
              <p>🚫 No outside treats; feed only vet-approved cafe treats.</p>
            </div>
          </div>

        </div>

        {/* Bottom Bar with Subtle Hidden Admin Access Trigger */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div>
            © {new Date().getFullYear()} Pherbies Cafe Malaysia. Rescuing, spaying, and loving one soul at a time.
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://www.threads.net/@pherbiescafe"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Threads @pherbiescafe
            </a>

            {/* Subtle Hidden Trigger: copyright dot and discrete admin lock */}
            <span
              onClick={onOpenAdmin}
              className="cursor-pointer hover:text-[#E07A5F] transition-colors select-none p-1"
              title="Founder Management Portal"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onOpenAdmin()}
            >
              ·
            </span>

            <button
              onClick={onOpenAdmin}
              className="opacity-40 hover:opacity-100 transition-opacity text-[11px] text-stone-400 hover:text-white flex items-center gap-1"
              title="Admin Login (Credentials: pherbiescute / pherbiescafecutie)"
            >
              <Lock className="w-3 h-3" />
              <span>Admin</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
