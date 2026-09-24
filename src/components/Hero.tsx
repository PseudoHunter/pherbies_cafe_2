import React from 'react';
import { Heart, Coffee, PawPrint, ShieldCheck, Sparkles, MapPin } from 'lucide-react';
import { AppData } from '../data/defaultData';

interface HeroProps {
  appData: AppData;
  onOpenDonation: () => void;
  onOpenReservation: () => void;
}

export const Hero: React.FC<HeroProps> = ({ appData, onOpenDonation, onOpenReservation }) => {
  const percentFunded = Math.min(
    100,
    Math.round((appData.impact.currentRaised / appData.impact.monthlyTarget) * 100)
  );

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Subtle organic background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#7A9A8B]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#E07A5F]/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Mission & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Mission Kicker */}
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#5A7A6B]">
              <span className="w-2 h-2 rounded-full bg-[#7A9A8B] animate-pulse"></span>
              <span className="tracking-wide uppercase text-[11px] font-bold">
                Malaysian Independent Cat Rescue & Cafe
              </span>
              <span className="text-stone-300">/</span>
              <span className="inline-flex items-center gap-1 text-[#2D3142]/70 font-normal">
                <MapPin className="w-3.5 h-3.5 text-[#E07A5F]" /> Klang Valley, MY
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif-title text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#2D3142] leading-[1.12]">
              Every sip brews hope. Every visit heals a{' '}
              <span className="italic text-[#E07A5F] underline decoration-[#E07A5F]/30 decoration-wavy decoration-2">
                rescue paw.
              </span>
            </h1>

            {/* Subtitle / Mission description */}
            <p className="text-base sm:text-lg text-[#2D3142]/80 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Pherbies Cafe is a grassroots cat rescue mission disguised as a cozy artisan coffee haven.
              Our cafe proceeds directly sustain <strong>8+ resident cats</strong> and power monthly{' '}
              <strong>TNR (Trap-Neuter-Return)</strong> operations across our neighborhood—covering
              RM 3,000 to RM 3,500 in monthly vet treatments, high-grade food, tofu litter, and recovery vitamins.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <a
                href="#cafe-menu"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#2D3142] text-white font-semibold text-sm hover:bg-[#1f222e] transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                <Coffee className="w-4 h-4 text-[#E07A5F]" />
                Explore Menu
              </a>

              <a
                href="#cats-gallery"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-[#7A9A8B] text-[#2D3142] bg-[#7A9A8B]/10 hover:bg-[#7A9A8B]/20 font-semibold text-sm transition-all active:scale-95"
              >
                <PawPrint className="w-4 h-4 text-[#7A9A8B]" />
                Meet Our Cats
              </a>

              <button
                onClick={onOpenDonation}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#E07A5F] text-white font-semibold text-sm hover:bg-[#C9664C] transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                <Heart className="w-4 h-4 fill-white/20" />
                Donate Now
              </button>
            </div>

            {/* Live Monthly Target Micro-Banner */}
            <div className="pt-4 border-t border-[#E8E2D5] max-w-xl mx-auto lg:mx-0">
              <div className="flex items-center justify-between text-xs text-[#2D3142]/80 mb-2">
                <span className="font-semibold flex items-center gap-1.5 text-[#5A7A6B]">
                  <ShieldCheck className="w-4 h-4" /> This Month's Medical & Care Target
                </span>
                <span className="font-bold text-[#2D3142]">
                  RM {appData.impact.currentRaised.toLocaleString()} / RM {appData.impact.monthlyTarget.toLocaleString()} ({percentFunded}%)
                </span>
              </div>
              <div className="w-full bg-[#EAE5D9] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-linear-to-r from-[#7A9A8B] via-[#E07A5F] to-[#E07A5F] h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${percentFunded}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-[#2D3142]/60 mt-1.5 flex items-center justify-between">
                <span>Funds vet bills, tofu litter, food & vaccinations</span>
                <a href="#impact-tracker" className="underline hover:text-[#E07A5F] transition-colors">
                  View breakdown →
                </a>
              </p>
            </div>
          </div>

          {/* Right Column: Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Photo Card */}
              <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-white">
                <img
                  src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1000&q=80"
                  alt="Pherbie, cafe mascot cat resting on cozy chair"
                  className="w-full h-80 sm:h-96 object-cover hover:scale-105 transition-transform duration-700"
                />
                
                {/* Photo Overlay Caption */}
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/40 to-transparent p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-[#E8E2D5] font-semibold">
                        Permanent Resident
                      </div>
                      <h3 className="font-serif-title text-xl font-bold">Pherbie (Mascot)</h3>
                    </div>
                    <span className="text-xs font-mono bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-md">
                      Rescued 2023
                    </span>
                  </div>
                  <p className="text-xs text-white/80 mt-1 line-clamp-2">
                    Found abandoned near a wet market with flu & injuries. Today he greets everyone who comes in.
                  </p>
                </div>
              </div>

              {/* Floating Mini Highlight Card 1 */}
              <div className="absolute -bottom-6 -left-6 sm:-left-8 bg-[#FFFDF8] border border-[#E8E2D5] rounded-2xl p-3.5 shadow-lg max-w-[210px] hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#7A9A8B]/15 text-[#5A7A6B] flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2D3142]">76+ TNR Spays</div>
                    <div className="text-[11px] text-[#2D3142]/70 leading-tight">
                      Neighborhood colonies humanely cared for
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Mini Highlight Card 2 */}
              <div className="absolute -top-5 -right-5 sm:-right-6 bg-[#FFFDF8] border border-[#E8E2D5] rounded-2xl p-3.5 shadow-lg max-w-[200px] hidden sm:block">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#E07A5F]/15 text-[#E07A5F] flex items-center justify-center shrink-0">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2D3142]">Artisan Brews</div>
                    <div className="text-[11px] text-[#2D3142]/70 leading-tight">
                      Pandan latte & warm sourdough
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
