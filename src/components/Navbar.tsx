import React, { useState, useEffect } from 'react';
import { Heart, Menu, X, Coffee, Cat } from 'lucide-react';

interface NavbarProps {
  onOpenDonation: () => void;
  onOpenReservation: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDonation, onOpenReservation }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Impact Tracker', href: '#impact-tracker' },
    { name: 'Rescue Cats', href: '#cats-gallery' },
    { name: 'Cafe Menu', href: '#cafe-menu' },
    { name: 'TNR Mission', href: '#tnr-log' },
    { name: 'Visit Us', href: '#reservations' },
  ];

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FFFDF8]/95 backdrop-blur-md border-b border-[#E8E2D5] shadow-xs'
          : 'bg-[#FFFDF8] border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-[#E07A5F]/10 border border-[#E07A5F]/20 flex items-center justify-center text-[#E07A5F] group-hover:bg-[#E07A5F] group-hover:text-white transition-all duration-300 shadow-xs">
              <Cat className="w-6 h-6 transform group-hover:rotate-6 transition-transform" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif-title font-bold text-xl sm:text-2xl text-[#2D3142] tracking-tight">
                  Pherbies Cafe
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A9A8B] hidden sm:inline">
                  Malaysia
                </span>
              </div>
              <p className="text-[11px] text-[#2D3142]/70 font-medium tracking-tight">
                Cat Rescue Mission & Artisan Cafe
              </p>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-[#2D3142]/80 hover:text-[#E07A5F] transition-colors relative py-1 hover:underline underline-offset-8 decoration-2 decoration-[#E07A5F]"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="https://www.threads.net/@pherbiescafe"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-[#2D3142]/80 hover:text-[#2D3142] hover:bg-[#F0ECE1] transition-all"
              title="Follow @pherbiescafe on Threads"
            >
              <span className="font-mono font-bold text-sm leading-none">@</span>
              Threads
            </a>

            <button
              onClick={onOpenReservation}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#7A9A8B]/40 text-[#2D3142] hover:bg-[#7A9A8B]/10 hover:border-[#7A9A8B] text-xs sm:text-sm font-semibold transition-all"
            >
              <Coffee className="w-4 h-4 text-[#7A9A8B]" />
              Book Table
            </button>

            <button
              onClick={onOpenDonation}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E07A5F] hover:bg-[#C9664C] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md transform active:scale-95"
            >
              <Heart className="w-4 h-4 fill-white/30" />
              Donate RM
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onOpenDonation}
              className="sm:hidden inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#E07A5F] text-white text-xs font-semibold"
            >
              <Heart className="w-3.5 h-3.5 fill-white/30" />
              Donate
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-[#2D3142] hover:bg-[#F0ECE1] transition-colors focus:outline-hidden"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#E8E2D5] bg-[#FFFDF8] px-4 pt-2 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-base font-medium text-[#2D3142] hover:bg-[#F8F4EB] rounded-lg transition-colors flex items-center justify-between"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E8E2D5] flex flex-col gap-2.5">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenReservation();
                }}
                className="flex-1 py-3 px-4 rounded-xl border border-[#7A9A8B] text-[#2D3142] font-semibold text-sm flex items-center justify-center gap-2 bg-[#7A9A8B]/5"
              >
                <Coffee className="w-4 h-4 text-[#7A9A8B]" />
                Book Table / Visit
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDonation();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[#E07A5F] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <Heart className="w-4 h-4 fill-white/20" />
                Donate Now
              </button>
            </div>

            <a
              href="https://www.threads.net/@pherbiescafe"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 text-center text-xs font-semibold text-[#2D3142]/70 hover:text-[#2D3142] flex items-center justify-center gap-1.5"
            >
              <span>Follow our rescue daily updates on Threads</span>
              <span className="font-mono font-bold text-sm">@pherbiescafe</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
