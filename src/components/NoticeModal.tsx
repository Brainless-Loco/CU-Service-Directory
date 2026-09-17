import React, { useState, useEffect } from 'react';
import { X, Bell, AlertCircle, Calendar, Sparkles } from 'lucide-react';
import { PortalNotice, NoticeType, NoticeStatus } from '../types';

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notice: PortalNotice) => void;
  noticeToEdit?: PortalNotice | null;
}

export const NoticeModal: React.FC<NoticeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  noticeToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NoticeType>('coming_soon');
  const [badgeText, setBadgeText] = useState('Coming Soon');
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState<NoticeStatus>('ACTIVE');
  const [formError, setFormError] = useState<string | null>(null);

  // Format date to datetime-local string (YYYY-MM-DDTHH:mm)
  const toDateTimeLocal = (date: Date): string => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    if (noticeToEdit) {
      setTitle(noticeToEdit.title);
      setMessage(noticeToEdit.message);
      setType(noticeToEdit.type);
      setBadgeText(noticeToEdit.badgeText || '');
      setLinkText(noticeToEdit.linkText || '');
      setLinkUrl(noticeToEdit.linkUrl || '');
      setStatus(noticeToEdit.status);

      try {
        setStartTime(toDateTimeLocal(new Date(noticeToEdit.startTime)));
        setEndTime(toDateTimeLocal(new Date(noticeToEdit.endTime)));
      } catch {
        setStartTime(toDateTimeLocal(new Date()));
        setEndTime(toDateTimeLocal(new Date(Date.now() + 7 * 86400000)));
      }
    } else {
      const now = new Date();
      const inOneWeek = new Date(Date.now() + 7 * 86400000);
      setTitle('');
      setMessage('');
      setType('coming_soon');
      setBadgeText('Coming Soon');
      setLinkText('Preview Details');
      setLinkUrl('');
      setStartTime(toDateTimeLocal(now));
      setEndTime(toDateTimeLocal(inOneWeek));
      setStatus('ACTIVE');
    }
    setFormError(null);
  }, [noticeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleTypeChange = (newType: NoticeType) => {
    setType(newType);
    if (!noticeToEdit) {
      if (newType === 'coming_soon') setBadgeText('Coming Soon');
      else if (newType === 'maintenance') setBadgeText('Maintenance');
      else if (newType === 'alert') setBadgeText('Urgent Alert');
      else if (newType === 'info') setBadgeText('Notice');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Notice headline title is required.');
      return;
    }

    if (!message.trim()) {
      setFormError('Notice body message is required.');
      return;
    }

    if (!startTime || !endTime) {
      setFormError('Both start date/time and end date/time are required.');
      return;
    }

    const startTimestamp = new Date(startTime).getTime();
    const endTimestamp = new Date(endTime).getTime();

    if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
      setFormError('Please enter valid dates and times.');
      return;
    }

    if (endTimestamp <= startTimestamp) {
      setFormError('End time must be set after the start time.');
      return;
    }

    const notice: PortalNotice = {
      id: noticeToEdit ? noticeToEdit.id : 'notice-' + Date.now(),
      title: title.trim(),
      message: message.trim(),
      type,
      badgeText: badgeText.trim() || undefined,
      linkText: linkText.trim() || undefined,
      linkUrl: linkUrl.trim() || undefined,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      status,
      createdAt: noticeToEdit ? noticeToEdit.createdAt : new Date().toISOString(),
    };

    onSave(notice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="notice-modal-dialog"
        className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 sm:p-7 my-8 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {noticeToEdit ? 'Edit Portal Notice' : 'Broadcast New Portal Notice'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Display time-windowed banner after header (Coming Soon, Maintenance, or Announcement)
              </p>
            </div>
          </div>
          <button
            id="close-notice-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Notice Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Notice Category / Severity Theme <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'coming_soon', label: 'Coming Soon', color: 'border-amber-400 bg-amber-50 text-amber-900' },
                { id: 'info', label: 'General Info', color: 'border-emerald-400 bg-emerald-50 text-emerald-900' },
                { id: 'maintenance', label: 'Maintenance', color: 'border-orange-400 bg-orange-50 text-orange-900' },
                { id: 'alert', label: 'Urgent Alert', color: 'border-rose-400 bg-rose-50 text-rose-900' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTypeChange(item.id as NoticeType)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all flex flex-col items-center gap-1 ${
                    type === item.id
                      ? `${item.color} ring-2 ring-emerald-500 font-bold shadow-2xs`
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title & Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notice Title / Headline <span className="text-rose-500">*</span>
              </label>
              <input
                id="notice-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. CU Smart Campus Mobile App Launching Soon"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Badge Pill Text
              </label>
              <input
                id="notice-badge-input"
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="e.g. Coming Soon"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Message Body */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notice Announcement Message <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="notice-message-input"
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the upcoming release, scheduled hours, or required user actions..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Time Window: Start Time and End Time */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <label className="text-xs font-bold text-slate-800">
                Broadcast Display Schedule (From Date/Time to Date/Time)
              </label>
            </div>
            <p className="text-2xs text-slate-500">
              The notice will automatically appear after the header only between these two timestamps.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-2xs font-semibold text-slate-700 mb-1">
                  Start Date & Time <span className="text-rose-500">*</span>
                </label>
                <input
                  id="notice-start-time-input"
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-2xs font-semibold text-slate-700 mb-1">
                  End Date & Time <span className="text-rose-500">*</span>
                </label>
                <input
                  id="notice-end-time-input"
                  type="datetime-local"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Action Link & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Action Button Label (Optional)
              </label>
              <input
                id="notice-link-text-input"
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="e.g. Learn More / View Schedule"
                className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Action Web URL (Optional)
              </label>
              <input
                id="notice-link-url-input"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://ict.cu.ac.bd/update"
                className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notice Status
              </label>
              <select
                id="notice-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as NoticeStatus)}
                className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold"
              >
                <option value="ACTIVE">ACTIVE (Display during schedule)</option>
                <option value="DISABLED">DISABLED (Hidden from portal)</option>
              </select>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            id="save-notice-submit-btn"
            onClick={handleSubmit}
            className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
          >
            {noticeToEdit ? 'Save Notice Changes' : 'Broadcast Notice'}
          </button>
        </div>
      </div>
    </div>
  );
};
