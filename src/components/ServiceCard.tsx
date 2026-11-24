import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Edit, Trash2, ArrowUpRight, Sparkles, Clock, EyeOff, Eye, Activity, MousePointerClick, RefreshCw } from 'lucide-react';
import { ServiceItem, ServiceHealthStatus } from '../types';
import { countWords, formatPortalDisplayUrl, truncateToMaxWords } from '../utils/textUtils';
import { isPingableWebLink } from '../services/healthCheckService';

interface ServiceCardProps {
  service: ServiceItem;
  isAdmin: boolean;
  healthStatus?: ServiceHealthStatus;
  clickCount?: number;
  onEdit?: (service: ServiceItem) => void;
  onDelete?: (serviceId: string) => void;
  onToggleStatus?: (serviceId: string) => void;
  onTrackClick?: (service: ServiceItem) => void;
  onPing?: (serviceId: string, url: string) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  isAdmin,
  healthStatus,
  clickCount,
  onEdit,
  onDelete,
  onToggleStatus,
  onTrackClick,
  onPing,
}) => {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!service.portalUrl) return;
    navigator.clipboard.writeText(service.portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVisitLink = () => {
    if (onTrackClick) {
      onTrackClick(service);
    }
  };

  // Determine aspect ratio class
  const getAspectClass = (ratio?: string) => {
    switch (ratio) {
      case '2:1':
        return 'aspect-[2/1]';
      case '3:2':
        return 'aspect-[3/2]';
      case '16:10':
        return 'aspect-[16/10]';
      case '16:9':
      default:
        return 'aspect-[16/9]';
    }
  };

  const isComingSoon = service.status === 'COMING_SOON';
  const isDisabled = service.status === 'DISABLED';
  const isWebUrl = isPingableWebLink(service.portalUrl);
  const hasUrl = Boolean(service.portalUrl && service.portalUrl.trim() !== '' && service.portalUrl !== 'https://');
  const isConfirmedLive = healthStatus?.isLive === true && healthStatus.statusCode === 200;
  const isHealthDown = Boolean(
    healthStatus && !healthStatus.isLive && !healthStatus.isChecking && healthStatus.statusCode !== 'CHECK_FAILED'
  );
  const descriptionWordCount = countWords(service.description);
  const displayDescription = truncateToMaxWords(service.description, 50);

  return (
    <div
      id={`service-card-${service.id}`}
      className={`group relative flex flex-col bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
        isDisabled
          ? 'border-slate-300 opacity-60 bg-slate-50/50'
          : isComingSoon
          ? 'border-amber-300/80 hover:border-amber-400 hover:shadow-md'
          : isWebUrl && isConfirmedLive
          ? 'border-emerald-300 hover:border-emerald-400 ring-1 ring-emerald-500/20 hover:shadow-md'
          : isWebUrl && isHealthDown
          ? 'border-rose-300 hover:border-rose-400 ring-1 ring-rose-500/20 hover:shadow-md'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* Landscape Logo / Banner Display with Reliable Background Color */}
      <div
        className={`relative w-full overflow-hidden border-b border-slate-100 flex items-center justify-center`}
        style={{
          backgroundColor: service.bgColor || '#0f172a',
        }}
      >
        {!imgError && service.logoUrl ? (
          <img
            src={service.logoUrl}
            alt={`${service.title} Logo`}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          /* Fallback Landscape Emblem Banner adhering to service.bgColor */
          <div
            className="w-full h-full flex flex-col items-center justify-center p-3 text-white"
            style={{ backgroundColor: service.bgColor || '#0f172a' }}
          >
            <div className="w-10 h-10 mb-2 p-1 bg-white/15 rounded-lg flex items-center justify-center backdrop-blur-xs shadow-xs border border-white/20">
              <img src="/cu-logo.svg" alt="CU" className="w-8 h-8 object-contain" />
            </div>
            <p className="text-sm font-bold text-center text-white line-clamp-1 drop-shadow-xs">{service.title}</p>
            <p className="text-2xs font-mono text-emerald-300 mt-0.5">services.cu.ac.bd</p>
          </div>
        )}

        {/* Top Badges over Logo */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10 pointer-events-none">
          {/* Status Badges */}
          {isComingSoon && (
            <span className="px-2 py-0.5 text-2xs font-bold uppercase tracking-wider bg-amber-500 text-slate-950 rounded shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Coming Soon</span>
            </span>
          )}

          {isDisabled && (
            <span className="px-2 py-0.5 text-2xs font-bold uppercase tracking-wider bg-slate-800 text-slate-200 rounded shadow-xs flex items-center gap-1">
              <EyeOff className="w-3 h-3" />
              <span>Disabled</span>
            </span>
          )}

          {/* Live 200 OK Pinging Indicator Badge */}
          {isWebUrl && !isComingSoon && !isDisabled && (
            healthStatus?.isChecking ? (
              <span className="px-2 py-0.5 text-2xs font-semibold bg-white/90 text-slate-700 backdrop-blur-xs rounded shadow-xs border border-slate-200 flex items-center gap-1">
                <RefreshCw className="w-2.5 h-2.5 animate-spin text-slate-500" />
                <span>Pinging...</span>
              </span>
            ) : healthStatus?.statusCode === 'CHECK_FAILED' ? (
              <span
                className="px-2 py-0.5 text-2xs font-semibold bg-slate-100 text-slate-600 rounded shadow-xs border border-slate-200"
                title={healthStatus.errorMessage || 'Portal health could not be checked'}
              >
                Status Unknown
              </span>
            ) : isConfirmedLive ? (
              <span
                className="px-2 py-0.5 text-2xs font-bold bg-emerald-500/95 text-white backdrop-blur-xs rounded shadow-xs flex items-center gap-1"
                title={`200 OK Active • Latency: ${healthStatus.latencyMs}ms`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                <span>Live</span>
              </span>
            ) : isHealthDown ? (
              <span
                className="px-2 py-0.5 text-2xs font-bold bg-rose-600/95 text-white backdrop-blur-xs rounded shadow-xs flex items-center gap-1"
                title={healthStatus.errorMessage || 'Portal connection failed or timed out'}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-200"></span>
                <span>Down</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 text-2xs font-semibold bg-slate-100 text-slate-600 rounded shadow-xs border border-slate-200 flex items-center gap-1">
                <RefreshCw className="w-2.5 h-2.5 text-slate-500" />
                <span>Checking...</span>
              </span>
            )
          )}

          {service.badgeText && !isComingSoon && !isDisabled && (
            <span className="px-2 py-0.5 text-2xs font-bold uppercase tracking-wider bg-white/90 text-slate-900 backdrop-blur-xs rounded shadow-2xs border border-slate-200">
              {service.badgeText}
            </span>
          )}
        </div>

        {/* Admin Floating Controls */}
        {isAdmin && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10 bg-white/95 backdrop-blur-xs p-1 rounded-lg shadow-xs border border-slate-200">
            {isWebUrl && onPing && (
              <button
                type="button"
                onClick={() => onPing(service.id, service.portalUrl!)}
                className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                title="Ping portal now to check if live or down (200 OK)"
              >
                <Activity className="w-3.5 h-3.5" />
              </button>
            )}

            {onToggleStatus && (
              <button
                type="button"
                onClick={() => onToggleStatus(service.id)}
                className={`p-1.5 rounded transition-colors ${
                  isDisabled
                    ? 'text-emerald-700 hover:bg-emerald-50'
                    : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                }`}
                title={isDisabled ? 'Enable Service on Portal' : 'Disable (Hide from public portal)'}
              >
                {isDisabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            )}

            <button
              type="button"
              id={`admin-edit-card-${service.id}`}
              onClick={() => onEdit && onEdit(service)}
              className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
              title="Edit service details"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              id={`admin-delete-card-${service.id}`}
              onClick={() => onDelete && onDelete(service.id)}
              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
              title="Delete service"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex min-w-0 flex-wrap flex-col items-baseline gap-1">
            <h3 className="inline-flex min-w-0 max-w-[100%] truncate rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1 text-sm font-bold tracking-tight text-emerald-950 transition-colors group-hover:border-emerald-200 group-hover:bg-emerald-100">
              {service.title}
            </h3>

            {hasUrl ? (
              <a
                href={service.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleVisitLink}
                title={`Visit ${service.title}: ${service.portalUrl}`}
                className="inline-flex shrink-0 items-center gap-1 mb-1 truncate text-xs font-medium text-emerald-700 transition-colors hover:text-emerald-900 hover:underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
              >
                <span className="min-w-0 truncate">{formatPortalDisplayUrl(service.portalUrl)}</span>
                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
              </a>
            ) : isComingSoon ? (
              <span className="shrink-0 text-xs font-medium text-amber-700">In Development</span>
            ) : null}

            {clickCount !== undefined && clickCount > 0 && (
              <span
                className="ml-auto flex shrink-0 items-center gap-1 font-mono text-2xs text-slate-500"
                title={`${clickCount} user clicks logged`}
              >
                <MousePointerClick className="h-3 w-3 text-emerald-600" />
                <span>{clickCount}</span>
              </span>
            )}
          </div>

          {/* Description displays up to 50 words without line-clamp truncation */}
          <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-snug">
            {displayDescription}{descriptionWordCount > 50 ? '…' : ''}
          </p>

          {/* Tags */}
          {service.tags && service.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {service.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-2xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Card Footer & Action Buttons */}
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Direct CTA Link / Coming Soon Action */}
          {isComingSoon && !hasUrl ? (
            <div className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs sm:text-sm font-semibold text-amber-900 bg-amber-100/90 border border-amber-300 rounded-lg select-none">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>Launching Soon</span>
            </div>
          ) : hasUrl ? (
            <a
              id={`visit-portal-${service.id}`}
              href={service.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleVisitLink}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs sm:text-sm font-semibold text-white rounded-lg transition-colors group/btn shadow-2xs ${
                isComingSoon
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : isHealthDown
                  ? 'bg-rose-700 hover:bg-rose-800'
                  : 'bg-slate-900 hover:bg-emerald-700'
              }`}
            >
              <span>{isComingSoon ? 'Visit Preview' : isHealthDown ? 'Visit (Down Alert)' : 'Visit Portal'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </a>
          ) : (
            <div className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium text-slate-500 bg-slate-100 rounded-lg">
              <span>Portal Offline</span>
            </div>
          )}

          {/* Copy Link Button */}
          {hasUrl && (
            <button
              id={`copy-portal-link-${service.id}`}
              onClick={handleCopyLink}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 shrink-0"
              title="Copy portal link address"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
