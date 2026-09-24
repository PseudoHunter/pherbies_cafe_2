import React, { useState } from 'react';
import { Cat as CatType } from '../data/defaultData';
import { Heart, Sparkles, ArrowRight, ShieldAlert, PawPrint } from 'lucide-react';

interface CatGalleryProps {
  cats: CatType[];
  onSelectCat: (cat: CatType) => void;
  onSponsorCat: (cat: CatType) => void;
}

export const CatGallery: React.FC<CatGalleryProps> = ({
  cats,
  onSelectCat,
  onSponsorCat,
}) => {
  const [filter, setFilter] = useState<'All' | 'Permanent Resident' | 'Up for Adoption' | 'Medical Recovery'>('All');

  const filteredCats = cats.filter((cat) => {
    if (filter === 'All') return true;
    return cat.status === filter;
  });

  const getStatusBadge = (status: CatType['status']) => {
    switch (status) {
      case 'Permanent Resident':
        return <span className="text-[#5A7A6B] font-semibold text-xs">Permanent Resident</span>;
      case 'Up for Adoption':
        return <span className="text-[#E07A5F] font-bold text-xs">Up for Adoption</span>;
      case 'Medical Recovery':
        return <span className="text-amber-800 font-semibold text-xs">Medical Recovery</span>;
    }
  };

  return (
    <section id="cats-gallery" className="py-16 sm:py-24 bg-[#FFFDF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs font-bold tracking-widest text-[#5A7A6B] uppercase mb-1 flex items-center gap-1.5">
              <PawPrint className="w-3.5 h-3.5 text-[#7A9A8B]" /> Resident Rescue Colony
            </div>
            <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#2D3142] tracking-tight">
              Meet Our Rescued Furkids
            </h2>
            <p className="text-sm sm:text-base text-[#2D3142]/75 mt-2 max-w-2xl">
              Each resident was saved from high-risk street conditions in the Klang Valley.
              Some are cafe lifers, others are seeking forever homes, and some are actively recuperating under medical care.
            </p>
          </div>

          {/* Interactive Filter Tabs (functional segmented control) */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[#F4EFE6] rounded-2xl self-start md:self-auto overflow-x-auto max-w-full">
            {(['All', 'Permanent Resident', 'Up for Adoption', 'Medical Recovery'] as const).map((tab) => {
              const count = tab === 'All' ? cats.length : cats.filter(c => c.status === tab).length;
              const isActive = filter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#FFFDF8] text-[#2D3142] shadow-xs'
                      : 'text-[#2D3142]/70 hover:text-[#2D3142]'
                  }`}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Cats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCats.map((cat) => (
            <div
              key={cat.id}
              className="bg-[#FFFDF8] rounded-3xl border border-[#E8E2D5] overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-[#7A9A8B]/60 transition-all duration-300 group"
            >
              <div>
                {/* Photo Container */}
                <div
                  className="relative h-60 w-full overflow-hidden bg-stone-100 cursor-pointer"
                  onClick={() => onSelectCat(cat)}
                >
                  <img
                    src={cat.photoUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                  
                  {/* Status Indicator Chip in Image */}
                  <div className="absolute top-3 left-3 bg-[#FFFDF8]/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-[#E8E2D5]/80 text-[11px] font-semibold text-[#2D3142]">
                    {getStatusBadge(cat.status)}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5">
                  {/* Unboxed Metadata Line (Zero-pill discipline) */}
                  <div className="flex items-center gap-2 text-xs text-[#2D3142]/60 mb-1.5 font-medium">
                    <span>{cat.gender}</span>
                    <span aria-hidden="true">·</span>
                    <span>{cat.estimatedAge}</span>
                    <span aria-hidden="true">·</span>
                    <span>Since {cat.arrivalDate}</span>
                  </div>

                  {/* Cat Name */}
                  <h3
                    className="font-serif-title text-xl font-bold text-[#2D3142] group-hover:text-[#E07A5F] transition-colors cursor-pointer"
                    onClick={() => onSelectCat(cat)}
                  >
                    {cat.name}
                  </h3>

                  {/* Short Bio */}
                  <p className="text-xs text-[#2D3142]/75 mt-2 line-clamp-3 leading-relaxed">
                    {cat.rescueStory}
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 pb-5 pt-3 border-t border-[#F2ECE1] flex items-center justify-between">
                <button
                  onClick={() => onSelectCat(cat)}
                  className="text-xs font-semibold text-[#2D3142] hover:text-[#E07A5F] flex items-center gap-1 transition-colors"
                >
                  Full Story <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onSponsorCat(cat)}
                  className="p-2 rounded-xl text-[#E07A5F] hover:bg-[#E07A5F]/10 transition-colors"
                  title={`Sponsor ${cat.name}`}
                  aria-label={`Sponsor ${cat.name}`}
                >
                  <Heart className="w-4 h-4 fill-none hover:fill-[#E07A5F]" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {filteredCats.length === 0 && (
          <div className="text-center py-16 bg-[#F9F6F0] rounded-3xl border border-dashed border-[#E8E2D5]">
            <p className="text-sm font-medium text-[#2D3142]/70">
              No cats found under this filter category.
            </p>
          </div>
        )}

      </div>
    </section>
  );
};
