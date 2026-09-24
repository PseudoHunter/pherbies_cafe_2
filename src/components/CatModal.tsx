import React from 'react';
import { X, Heart, Shield, Calendar, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { Cat } from '../data/defaultData';

interface CatModalProps {
  cat: Cat | null;
  onClose: () => void;
  onSponsor: (cat: Cat) => void;
  onAdoptInquiry: (cat: Cat) => void;
}

export const CatModal: React.FC<CatModalProps> = ({
  cat,
  onClose,
  onSponsor,
  onAdoptInquiry,
}) => {
  if (!cat) return null;

  const statusColors = {
    'Permanent Resident': 'text-[#5A7A6B] bg-[#7A9A8B]/10 border-[#7A9A8B]/30',
    'Up for Adoption': 'text-[#E07A5F] bg-[#E07A5F]/10 border-[#E07A5F]/30',
    'Medical Recovery': 'text-amber-800 bg-amber-500/10 border-amber-500/30',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-[#FFFDF8] rounded-3xl max-w-2xl w-full border border-[#E8E2D5] shadow-2xl overflow-hidden my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative h-64 sm:h-72 w-full bg-stone-100">
          <img
            src={cat.photoUrl}
            alt={cat.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent"></div>

          <div className="absolute bottom-4 left-5 right-5 text-white">
            <div className="flex items-center gap-2 text-xs font-semibold mb-1">
              <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm bg-white/20">
                {cat.status}
              </span>
              <span className="text-white/80">·</span>
              <span>Rescued {cat.arrivalDate}</span>
            </div>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-bold">
              {cat.name}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Quick Info Bar */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-[#F9F6F0] rounded-2xl border border-[#E8E2D5] text-center text-xs">
            <div>
              <div className="text-[#2D3142]/60 uppercase text-[10px] tracking-wider font-semibold">
                Gender
              </div>
              <div className="font-bold text-[#2D3142] text-sm mt-0.5">{cat.gender}</div>
            </div>
            <div className="border-x border-[#E8E2D5]">
              <div className="text-[#2D3142]/60 uppercase text-[10px] tracking-wider font-semibold">
                Estimated Age
              </div>
              <div className="font-bold text-[#2D3142] text-sm mt-0.5">{cat.estimatedAge}</div>
            </div>
            <div>
              <div className="text-[#2D3142]/60 uppercase text-[10px] tracking-wider font-semibold">
                Status
              </div>
              <div className="font-bold text-[#5A7A6B] text-sm mt-0.5 truncate px-1">
                {cat.status}
              </div>
            </div>
          </div>

          {/* Rescue Story */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase tracking-wider font-bold text-[#5A7A6B] flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#7A9A8B]" /> Rescue Journey
            </h4>
            <p className="text-sm text-[#2D3142]/85 leading-relaxed bg-[#FFFDF8]">
              {cat.rescueStory}
            </p>
          </div>

          {/* Personality & Quirks */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase tracking-wider font-bold text-[#E07A5F] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#E07A5F]" /> Personality & Quirks
            </h4>
            <p className="text-sm text-[#2D3142]/85 leading-relaxed">
              {cat.personality}
            </p>
          </div>

          {/* Treats & Medical Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#FBF9F3] border border-[#EFEAE0]">
              <span className="font-bold text-[#2D3142] block mb-1">Favorite Treat:</span>
              <span className="text-[#2D3142]/80">{cat.favoriteTreat}</span>
            </div>
            {cat.medicalNotes && (
              <div className="p-3.5 rounded-xl bg-[#FBF9F3] border border-[#EFEAE0]">
                <span className="font-bold text-[#2D3142] block mb-1">Medical Care:</span>
                <span className="text-[#2D3142]/80">{cat.medicalNotes}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#E8E2D5] flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              onClick={() => onSponsor(cat)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#7A9A8B] text-[#2D3142] hover:bg-[#7A9A8B]/10 font-semibold text-xs sm:text-sm transition-all"
            >
              <Heart className="w-4 h-4 text-[#E07A5F]" />
              Sponsor {cat.name}'s Care
            </button>

            {cat.status === 'Up for Adoption' && (
              <button
                onClick={() => onAdoptInquiry(cat)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#E07A5F] hover:bg-[#C9664C] text-white font-semibold text-xs sm:text-sm transition-all shadow-sm"
              >
                Inquire to Adopt {cat.name}
              </button>
            )}

            {cat.status !== 'Up for Adoption' && (
              <a
                href="#reservations"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#2D3142] hover:bg-[#1f222e] text-white font-semibold text-xs sm:text-sm transition-all"
              >
                Visit {cat.name} at the Cafe
              </a>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
