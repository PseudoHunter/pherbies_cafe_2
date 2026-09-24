import React from 'react';
import { Sparkles, MapPin, CheckCircle2, Calendar, ShieldCheck, HeartHandshake, Scissors } from 'lucide-react';
import { TnrLog, AppData } from '../data/defaultData';

interface TnrSectionProps {
  appData: AppData;
  onOpenDonation: () => void;
}

export const TnrSection: React.FC<TnrSectionProps> = ({ appData, onOpenDonation }) => {
  const { tnrLogs, impact } = appData;

  const tnrSteps = [
    {
      step: '01',
      title: 'Humanely Trap',
      desc: 'Using gentle drop traps and feeding routines, avoiding trauma to street cats.',
    },
    {
      step: '02',
      title: 'Neuter & Vaccinate',
      desc: 'Professional clinic surgery, rabies/core shots, and distinctive ear-tipping for identification.',
    },
    {
      step: '03',
      title: 'Post-Op Recovery',
      desc: '24-48 hours indoor observation with antibiotic care to ensure surgical wounds heal smoothly.',
    },
    {
      step: '04',
      title: 'Return & Care',
      desc: 'Released back to familiar neighborhood territory with dedicated community feeders monitoring daily.',
    },
  ];

  return (
    <section id="tnr-log" className="py-16 sm:py-24 bg-[#FFFDF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs font-bold tracking-widest text-[#5A7A6B] uppercase mb-1 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-[#7A9A8B]" /> Neighborhood Humane Population Control
            </div>
            <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#2D3142] tracking-tight">
              Rescue Operations & Monthly TNR Log
            </h2>
            <p className="text-sm sm:text-base text-[#2D3142]/75 mt-2 max-w-2xl">
              TNR (Trap-Neuter-Return) is the only proven, humane solution to curb stray feline suffering in Malaysia.
              Every month, our founder and volunteer feeders hit the ground to spay, vaccinate, and rehabilitate.
            </p>
          </div>

          <button
            onClick={onOpenDonation}
            className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#7A9A8B] hover:bg-[#5A7A6B] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
          >
            <HeartHandshake className="w-4 h-4" />
            Sponsor a TNR Spay (RM 150)
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          <div className="bg-[#F8F5EE] rounded-2xl p-5 border border-[#E8E2D5] text-center">
            <div className="font-serif-title text-3xl sm:text-4xl font-extrabold text-[#E07A5F] mb-1">
              {impact.totalTnrCount}+
            </div>
            <div className="text-xs font-semibold text-[#2D3142]/80">
              Community Cats Neutered
            </div>
            <div className="text-[11px] text-[#2D3142]/60 mt-0.5">
              Zero reproduction cycle
            </div>
          </div>

          <div className="bg-[#F8F5EE] rounded-2xl p-5 border border-[#E8E2D5] text-center">
            <div className="font-serif-title text-3xl sm:text-4xl font-extrabold text-[#7A9A8B] mb-1">
              {impact.totalCatsRescued}
            </div>
            <div className="text-xs font-semibold text-[#2D3142]/80">
              Medical Rescues Handled
            </div>
            <div className="text-[11px] text-[#2D3142]/60 mt-0.5">
              Fractures, infections & flu
            </div>
          </div>

          <div className="bg-[#F8F5EE] rounded-2xl p-5 border border-[#E8E2D5] text-center">
            <div className="font-serif-title text-3xl sm:text-4xl font-extrabold text-[#2D3142] mb-1">
              {impact.activeColoniesMonitored}
            </div>
            <div className="text-xs font-semibold text-[#2D3142]/80">
              Colonies Monitored
            </div>
            <div className="text-[11px] text-[#2D3142]/60 mt-0.5">
              Fed & protected daily
            </div>
          </div>

          <div className="bg-[#F8F5EE] rounded-2xl p-5 border border-[#E8E2D5] text-center">
            <div className="font-serif-title text-3xl sm:text-4xl font-extrabold text-[#D4A373] mb-1">
              100%
            </div>
            <div className="text-xs font-semibold text-[#2D3142]/80">
              Volunteer & Cafe Driven
            </div>
            <div className="text-[11px] text-[#2D3142]/60 mt-0.5">
              No government funding
            </div>
          </div>
        </div>

        {/* TNR Educational Methodology */}
        <div className="bg-[#F2EFE8] rounded-3xl p-6 sm:p-8 border border-[#E2DBD0] mb-14">
          <h3 className="font-serif-title text-xl font-bold text-[#2D3142] mb-2 text-center sm:text-left">
            How The Pherbies TNR Process Operates
          </h3>
          <p className="text-xs sm:text-sm text-[#2D3142]/75 mb-6 text-center sm:text-left max-w-3xl">
            Instead of culling or letting kittens suffer on harsh streets, Trap-Neuter-Return stabilizes stray populations while ensuring healthier, vaccinated community cats.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tnrSteps.map((st) => (
              <div key={st.step} className="bg-[#FFFDF8] rounded-2xl p-4 border border-[#E8E2D5]">
                <div className="text-xs font-mono font-bold text-[#E07A5F] mb-1">
                  STAGE {st.step}
                </div>
                <h4 className="font-bold text-sm text-[#2D3142] mb-1">{st.title}</h4>
                <p className="text-xs text-[#2D3142]/70 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chronological Mission Log Cards */}
        <div className="space-y-4">
          <h3 className="font-serif-title text-xl font-bold text-[#2D3142] mb-4">
            Recent & Upcoming Neighborhood Drives
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tnrLogs.map((log) => (
              <div
                key={log.id}
                className="bg-[#FFFDF8] rounded-3xl border border-[#E8E2D5] p-5 sm:p-6 flex flex-col sm:flex-row gap-5 hover:border-[#7A9A8B]/60 transition-all hover:shadow-xs"
              >
                {/* Image */}
                <div className="w-full sm:w-44 h-40 rounded-2xl overflow-hidden shrink-0 bg-stone-100">
                  <img
                    src={log.photoUrl}
                    alt={log.location}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-xs font-semibold text-[#5A7A6B] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#7A9A8B]" /> {log.date}
                      </span>
                      <span
                        className={`text-[11px] font-semibold ${
                          log.status === 'Completed' ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {log.status === 'Completed' ? '✓ Completed' : '⏳ In Preparation'}
                      </span>
                    </div>

                    <h4 className="font-serif-title text-base font-bold text-[#2D3142] mb-1 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-[#E07A5F] shrink-0" /> {log.location}
                    </h4>

                    <p className="text-xs text-[#2D3142]/75 leading-relaxed mt-2">
                      {log.notes}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#F2ECE1] flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#2D3142]">
                      {log.catsNeutered} cats spayed/neutered
                    </span>
                    <span className="text-[#2D3142]/60">Ear-tipped & healed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
