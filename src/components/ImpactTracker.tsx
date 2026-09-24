import React from 'react';
import { Heart, Stethoscope, UtensilsCrossed, Package, Activity, ArrowUpRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AppData } from '../data/defaultData';

interface ImpactTrackerProps {
  appData: AppData;
  onOpenDonation: () => void;
}

export const ImpactTracker: React.FC<ImpactTrackerProps> = ({ appData, onOpenDonation }) => {
  const { monthlyTarget, currentRaised, breakdown } = appData.impact;
  const percentage = Math.min(100, Math.round((currentRaised / monthlyTarget) * 100));
  const remaining = Math.max(0, monthlyTarget - currentRaised);

  // Breakdown items with target allocations
  const breakdownItems = [
    {
      label: 'Veterinary Care & Spay/Neuter',
      amount: breakdown.vetBills,
      target: 1800,
      icon: Stethoscope,
      color: '#E07A5F',
      desc: 'Blood tests, emergency wounds, spay surgeries, vaccinations & recovery meds',
    },
    {
      label: 'Nutritious Cat Food & Kibbles',
      amount: breakdown.catFood,
      target: 800,
      icon: UtensilsCrossed,
      color: '#7A9A8B',
      desc: 'High-protein grain-free wet cans, recovery mousse, and quality adult kibbles',
    },
    {
      label: 'Soy Tofu Cat Litter',
      amount: breakdown.tofuLitter,
      target: 550,
      icon: Package,
      color: '#D4A373',
      desc: 'Dust-free natural flushable tofu litter for indoor cat health and respiratory safety',
    },
    {
      label: 'Vitamins & Recovery Supplements',
      amount: breakdown.vitamins,
      target: 350,
      icon: Activity,
      color: '#819890',
      desc: 'Lysine for immune support, joint supplements for Ciko, probiotics, and eye drops',
    },
  ];

  return (
    <section id="impact-tracker" className="py-16 sm:py-20 bg-[#F9F6F0] border-y border-[#E8E2D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <div className="text-xs font-bold tracking-widest text-[#5A7A6B] uppercase">
            Transparent Rescue Accounting
          </div>
          <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#2D3142] tracking-tight">
            Monthly Medical & Care Impact Tracker
          </h2>
          <p className="text-sm sm:text-base text-[#2D3142]/75 leading-relaxed">
            Taking in injured strays and executing monthly TNR requires continuous veterinary care.
            Our monthly baseline survival expenses run between <strong>RM 3,000 and RM 3,500</strong>.
            Here is our current funding progress for this month:
          </p>
        </div>

        {/* Central Progress Bar Display */}
        <div className="bg-[#FFFDF8] rounded-3xl p-6 sm:p-10 border border-[#E8E2D5] shadow-sm max-w-4xl mx-auto mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-[#2D3142]/60 mb-1">
                Current Monthly Goal (September)
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif-title text-4xl sm:text-5xl font-bold text-[#2D3142]">
                  RM {currentRaised.toLocaleString()}
                </span>
                <span className="text-base sm:text-lg font-medium text-[#2D3142]/60">
                  raised of RM {monthlyTarget.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="text-right sm:text-right flex sm:flex-col justify-between items-center sm:items-end">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#E07A5F]">
                {percentage}%
              </span>
              <span className="text-xs text-[#2D3142]/70 font-medium">
                {remaining === 0 ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Monthly goal achieved!
                  </span>
                ) : (
                  `RM ${remaining.toLocaleString()} remaining to reach target`
                )}
              </span>
            </div>
          </div>

          {/* Progress Bar with Gradient */}
          <div className="w-full bg-[#EAE5D9] h-5 rounded-full overflow-hidden p-1 relative shadow-inner">
            <div
              className="bg-linear-to-r from-[#7A9A8B] via-[#E07A5F] to-[#C9664C] h-full rounded-full transition-all duration-1000 ease-out shadow-xs relative"
              style={{ width: `${percentage}%` }}
            >
              {/* Subtle shine effect */}
              <div className="absolute inset-0 bg-white/20 rounded-full"></div>
            </div>
          </div>

          {/* Quick CTA and note */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#E8E2D5]">
            <div className="text-xs text-[#2D3142]/70 text-center sm:text-left">
              <strong>100% Transparency:</strong> Updates instantly whenever a donation is pledged.
              Receipts are shared on our social threads monthly.
            </div>
            <button
              onClick={onOpenDonation}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#E07A5F] hover:bg-[#C9664C] text-white font-semibold text-sm transition-all shadow-sm hover:shadow active:scale-95 shrink-0"
            >
              <Heart className="w-4 h-4 fill-white/20" />
              Pledge a Donation
            </button>
          </div>
        </div>

        {/* Breakdown Indicators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto mb-14">
          {breakdownItems.map((item) => {
            const Icon = item.icon;
            const itemPercent = Math.min(100, Math.round((item.amount / item.target) * 100));

            return (
              <div
                key={item.label}
                className="bg-[#FFFDF8] rounded-2xl p-5 border border-[#E8E2D5] flex flex-col justify-between hover:border-[#7A9A8B]/60 transition-all hover:shadow-xs group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{ backgroundColor: `${item.color}15`, color: item.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-[#2D3142]/70 font-mono">
                      {itemPercent}%
                    </span>
                  </div>

                  <h3 className="font-serif-title font-bold text-base text-[#2D3142] mb-1 leading-snug">
                    {item.label}
                  </h3>
                  <p className="text-xs text-[#2D3142]/70 leading-relaxed mb-4">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F0ECE1]">
                  <div className="flex items-baseline justify-between text-xs mb-1.5">
                    <span className="font-bold text-[#2D3142]">RM {item.amount}</span>
                    <span className="text-[#2D3142]/60">Target RM {item.target}</span>
                  </div>
                  <div className="w-full bg-[#EAE5D9] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${itemPercent}%`,
                        backgroundColor: item.color,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Community Guardians & Recent Donors Wall */}
        <div className="max-w-4xl mx-auto bg-[#FFFDF8] rounded-2xl p-6 sm:p-8 border border-[#E8E2D5]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="font-serif-title text-xl font-bold text-[#2D3142]">
                Recent Community Guardians
              </h3>
              <p className="text-xs text-[#2D3142]/70">
                Kind souls making sure no bowl is empty and no wound goes untreated.
              </p>
            </div>
            <button
              onClick={onOpenDonation}
              className="text-xs font-semibold text-[#E07A5F] hover:text-[#C9664C] flex items-center gap-1 self-start sm:self-auto"
            >
              Add your name to the wall <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {appData.recentDonations.slice(0, 4).map((donation) => (
              <div
                key={donation.id}
                className="p-3.5 rounded-xl bg-[#FBF9F3] border border-[#EFEAE0] flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-[#2D3142]">{donation.donorName}</span>
                  <span className="text-xs font-bold text-[#E07A5F] font-mono">
                    +RM {donation.amount}
                  </span>
                </div>
                {donation.message && (
                  <p className="text-xs text-[#2D3142]/80 italic line-clamp-2">
                    "{donation.message}"
                  </p>
                )}
                <span className="text-[10px] text-[#2D3142]/50 mt-2 block">
                  {donation.date}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
