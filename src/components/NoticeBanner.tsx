import React, { useState } from 'react';
import { Sparkles, AlertTriangle, Info, Clock, ExternalLink, X, ChevronRight, BellRing } from 'lucide-react';
import { PortalNotice, NoticeType } from '../types';

interface NoticeBannerProps {
  notices: PortalNotice[];
}

export const NoticeBanner: React.FC<NoticeBannerProps> = ({ notices }) => {
  // Track dismissed notice IDs for current session
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [activeNoticeIndex, setActiveNoticeIndex] = useState(0);

  const currentTime = new Date().getTime();

  // Filter notices that are:
  // 1. status === 'ACTIVE'
  // 2. currentTime >= startTime
  // 3. currentTime <= endTime
  // 4. not dismissed by user in this session
  const visibleNotices = notices.filter((n) => {
    if (n.status !== 'ACTIVE') return false;
    if (dismissedIds.includes(n.id)) return false;

    const start = new Date(n.startTime).getTime();
    const end = new Date(n.endTime).getTime();

    // Check time window validity
    if (!isNaN(start) && currentTime < start) return false;
    if (!isNaN(end) && currentTime > end) return false;

    return true;
  });

  if (visibleNotices.length === 0) return null;

  const currentNotice = visibleNotices[activeNoticeIndex % visibleNotices.length];

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
  };

  const getNoticeTheme = (type: NoticeType) => {
    switch (type) {
      case 'coming_soon':
        return {
          wrapper: 'bg-amber-50/90 border-amber-300 text-amber-950',
          badge: 'bg-amber-500 text-slate-950 font-bold',
          icon: <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />,
          accent: 'text-amber-800',
          btn: 'bg-amber-600 hover:bg-amber-700 text-white',
        };
      case 'alert':
        return {
          wrapper: 'bg-rose-50/90 border-rose-300 text-rose-950',
          badge: 'bg-rose-600 text-white font-semibold',
          icon: <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />,
          accent: 'text-rose-800',
          btn: 'bg-rose-600 hover:bg-rose-700 text-white',
        };
      case 'maintenance':
        return {
          wrapper: 'bg-orange-50/90 border-orange-300 text-orange-950',
          badge: 'bg-orange-500 text-white font-semibold',
          icon: <Clock className="w-4 h-4 text-orange-600 shrink-0" />,
          accent: 'text-orange-800',
          btn: 'bg-orange-600 hover:bg-orange-700 text-white',
        };
      case 'warning':
        return {
          wrapper: 'bg-yellow-50/90 border-yellow-300 text-yellow-950',
          badge: 'bg-yellow-500 text-slate-950 font-semibold',
          icon: <AlertTriangle className="w-4 h-4 text-yellow-700 shrink-0" />,
          accent: 'text-yellow-800',
          btn: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        };
      case 'info':
      default:
        return {
          wrapper: 'bg-emerald-50/90 border-emerald-300 text-emerald-950',
          badge: 'bg-emerald-600 text-white font-semibold',
          icon: <Info className="w-4 h-4 text-emerald-600 shrink-0" />,
          accent: 'text-emerald-800',
          btn: 'bg-emerald-700 hover:bg-emerald-800 text-white',
        };
    }
  };

  const theme = getNoticeTheme(currentNotice.type);

  // Format end time for user display if relevant
  const formatEndDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <aside
      id="portal-notice-broadcast-bar"
      aria-label="Official University Notice"
      className={`border-b ${theme.wrapper} px-4 py-3 sm:px-6 transition-all shadow-2xs relative`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left icon, badge, title and message */}
        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
          <div className="p-1.5 rounded-lg bg-white/70 shadow-2xs shrink-0 mt-0.5 sm:mt-0">
            {theme.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2 py-0.5 text-2xs uppercase tracking-wider rounded ${theme.badge}`}>
                {currentNotice.badgeText || (currentNotice.type === 'coming_soon' ? 'Coming Soon' : 'Notice')}
              </span>
              <h3 className="text-xs sm:text-sm font-bold tracking-tight line-clamp-1">
                {currentNotice.title}
              </h3>
              {visibleNotices.length > 1 && (
                <span className="text-2xs text-slate-500 font-mono">
                  ({(activeNoticeIndex % visibleNotices.length) + 1}/{visibleNotices.length})
                </span>
              )}
            </div>

            <p className="text-xs text-slate-700 mt-1 sm:mt-0.5 line-clamp-2 leading-relaxed">
              {currentNotice.message}
            </p>
          </div>
        </div>

        {/* Right action link and controls */}
        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
          {currentNotice.endTime && (
            <span className="hidden lg:inline text-2xs text-slate-500">
              Valid until {formatEndDate(currentNotice.endTime)}
            </span>
          )}

          {currentNotice.linkUrl && (
            <a
              href={currentNotice.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-colors ${theme.btn}`}
            >
              <span>{currentNotice.linkText || 'Details'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {visibleNotices.length > 1 && (
            <button
              onClick={() => setActiveNoticeIndex((prev) => prev + 1)}
              className="p-1 text-slate-600 hover:text-slate-900 rounded bg-white/50 hover:bg-white text-xs flex items-center gap-0.5"
              title="Next notice"
            >
              <span className="text-2xs">Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => handleDismiss(currentNotice.id)}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-black/5 transition-colors"
            title="Dismiss notice for this session"
            aria-label="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
