import React, { useState } from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { Announcement } from '../data/defaultData';

interface AnnouncementBannerProps {
  announcement: Announcement;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ announcement }) => {
  const [dismissed, setDismissed] = useState(false);

  if (!announcement.enabled || dismissed) return null;

  return (
    <div className="bg-[#E07A5F] text-white px-4 py-2.5 text-xs sm:text-sm font-medium relative transition-colors z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 justify-center text-center flex-wrap">
          <span className="inline-flex items-center gap-1.5 font-bold tracking-wide uppercase text-[11px] bg-white/20 px-2 py-0.5 rounded">
            <Sparkles className="w-3.5 h-3.5" />
            {announcement.highlightText || 'Rescue News'}
          </span>
          <span className="text-white/95">{announcement.text}</span>
          {announcement.linkText && (
            <a
              href={`#${announcement.linkSection || 'impact-tracker'}`}
              className="inline-flex items-center gap-1 underline underline-offset-4 font-semibold hover:text-white/80 transition-colors ml-1"
            >
              {announcement.linkText}
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-black/10 rounded-full transition-colors text-white/80 hover:text-white shrink-0"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
