import React, { useState, useEffect } from 'react';
import { X, Upload, Link2, AlertCircle } from 'lucide-react';
import { ServiceItem, ServiceGroup, LogoRatio, ServiceStatus } from '../types';
import { validateWordCount, truncateToMaxWords, fileToBase64 } from '../utils/textUtils';
import { createLandscapeLogoSvg } from '../data/seedData';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: ServiceItem) => void;
  serviceToEdit?: ServiceItem | null;
  groups: ServiceGroup[];
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  serviceToEdit,
  groups,
}) => {
  const [title, setTitle] = useState('');
  const [groupId, setGroupId] = useState(groups[0]?.id || '');
  const [portalUrl, setPortalUrl] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoInputType, setLogoInputType] = useState<'url' | 'upload' | 'preset'>('preset');
  const [logoRatio, setLogoRatio] = useState<LogoRatio>('16:9');
  const [bgColor, setBgColor] = useState('#064e3b');
  const [badgeText, setBadgeText] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [status, setStatus] = useState<ServiceStatus>('ACTIVE');
  const [formError, setFormError] = useState<string | null>(null);

  const COLOR_PALETTE = [
    { name: 'CU Emerald', hex: '#064e3b' },
    { name: 'Forest Pine', hex: '#14532d' },
    { name: 'Chittagong Navy', hex: '#0f172a' },
    { name: 'Midnight Blue', hex: '#1e293b' },
    { name: 'Royal Blue', hex: '#1e3a8a' },
    { name: 'Ocean Cobalt', hex: '#1d4ed8' },
    { name: 'Sky Cerulean', hex: '#0284c7' },
    { name: 'Hills Teal', hex: '#134e4a' },
    { name: 'Deep Cyan', hex: '#0e7490' },
    { name: 'University Crimson', hex: '#881337' },
    { name: 'Deep Rose', hex: '#9f1239' },
    { name: 'Ruby Wine', hex: '#701a75' },
    { name: 'Classic Indigo', hex: '#312e81' },
    { name: 'Deep Violet', hex: '#581c87' },
    { name: 'Imperial Purple', hex: '#4c1d95' },
    { name: 'Amber Gold', hex: '#78350f' },
    { name: 'Sunset Bronze', hex: '#9a3412' },
    { name: 'Terracotta', hex: '#c2410c' },
    { name: 'Olive Moss', hex: '#3f6212' },
    { name: 'Graphite Slate', hex: '#334155' },
    { name: 'Charcoal Dark', hex: '#18181b' },
    { name: 'Steel Neutral', hex: '#475569' },
    { name: 'Muted Taupe', hex: '#57534e' },
    { name: 'Clean Light', hex: '#f8fafc' },
  ];

  useEffect(() => {
    if (serviceToEdit) {
      setTitle(serviceToEdit.title);
      setGroupId(serviceToEdit.groupId);
      setPortalUrl(serviceToEdit.portalUrl || '');
      setDescription(serviceToEdit.description);
      setLogoUrl(serviceToEdit.logoUrl);
      setLogoRatio(serviceToEdit.logoRatio || '16:9');
      setBgColor(serviceToEdit.bgColor || '#064e3b');
      setBadgeText(serviceToEdit.badgeText || '');
      setTagsInput(serviceToEdit.tags ? serviceToEdit.tags.join(', ') : '');
      setStatus(serviceToEdit.status || 'ACTIVE');
      const isSvgPreset = serviceToEdit.logoUrl.startsWith('data:image/svg+xml');
      const isUpload = serviceToEdit.logoUrl.startsWith('data:image/') && !isSvgPreset;
      setLogoInputType(isSvgPreset ? 'preset' : isUpload ? 'upload' : 'url');
    } else {
      setTitle('');
      setGroupId(groups[0]?.id || '');
      setPortalUrl('');
      setDescription('');
      setLogoRatio('16:9');
      setBgColor('#064e3b');
      setBadgeText('');
      setTagsInput('');
      setStatus('ACTIVE');
      setLogoInputType('preset');
      setLogoUrl(createLandscapeLogoSvg('CU New Portal', 'Student & Academic Service', '#064e3b,#022c22', '#34d399'));
    }
    setFormError(null);
  }, [serviceToEdit, isOpen, groups]);

  if (!isOpen) return null;

  const wordValidation = validateWordCount(description, 50);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const testValidation = validateWordCount(val, 50);
    if (testValidation.count > 50) {
      setDescription(truncateToMaxWords(val, 50));
    } else {
      setDescription(val);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setLogoUrl(base64);
        setFormError(null);
      } catch {
        setFormError('Failed to read uploaded image. Please try another file.');
      }
    }
  };

  const applyPresetLogo = (name: string, bg: string, accent: string) => {
    const generated = createLandscapeLogoSvg(title || name, 'University of Chittagong', bg, accent);
    setLogoUrl(generated);
  };

  const handleUpdateColor = (newColor: string, autoUpdateLogo: boolean = true) => {
    let cleanHex = newColor.trim();
    if (!cleanHex.startsWith('#') && /^[0-9A-Fa-f]{3,8}$/.test(cleanHex)) {
      cleanHex = '#' + cleanHex;
    }
    setBgColor(cleanHex);

    if (autoUpdateLogo && (logoInputType === 'preset' || logoUrl.startsWith('data:image/svg+xml'))) {
      const generated = createLandscapeLogoSvg(
        title.trim() || 'CU Portal',
        'University of Chittagong',
        cleanHex,
        '#38bdf8'
      );
      setLogoUrl(generated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Service title is required.');
      return;
    }

    // Portal URL is required EXCEPT when status === 'COMING_SOON'
    const isComingSoon = status === 'COMING_SOON';
    if (!isComingSoon && (!portalUrl.trim() || portalUrl === 'https://')) {
      setFormError('Valid portal URL is required for active services (e.g. https://cu.ac.bd). Set status to "Coming Soon" if the portal link is not ready yet.');
      return;
    }

    if (wordValidation.isOverLimit) {
      setFormError('Description exceeds the maximum allowed 50 words.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const savedItem: ServiceItem = {
      id: serviceToEdit ? serviceToEdit.id : 'srv-' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      groupId: groupId || groups[0]?.id || 'group-student',
      portalUrl: portalUrl.trim() || undefined,
      logoUrl: logoUrl || createLandscapeLogoSvg(title, 'CU Official Service', `${bgColor},#0f172a`, '#38bdf8'),
      logoRatio,
      bgColor: bgColor.trim() || '#064e3b',
      tags,
      badgeText: badgeText.trim() || (isComingSoon ? 'Coming Soon' : undefined),
      status,
      updatedAt: new Date().toISOString(),
    };

    onSave(savedItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="service-modal-dialog"
        className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 sm:p-7 my-8 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {serviceToEdit ? 'Edit Service Portal' : 'Add New CU Service Portal'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure portal card details, status (Active / Disabled / Coming Soon), and landscape logo
            </p>
          </div>
          <button
            id="close-service-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Service Status Selector Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Service Availability Status <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('ACTIVE')}
                className={`p-2.5 rounded-lg border text-xs font-semibold text-left transition-all ${
                  status === 'ACTIVE'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500 font-bold'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span>ACTIVE</span>
                </div>
                <span className="text-2xs font-normal text-slate-500 block mt-0.5">
                  Live & published on portal
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('DISABLED')}
                className={`p-2.5 rounded-lg border text-xs font-semibold text-left transition-all ${
                  status === 'DISABLED'
                    ? 'border-slate-600 bg-slate-100 text-slate-900 ring-2 ring-slate-600 font-bold'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                  <span>DISABLED</span>
                </div>
                <span className="text-2xs font-normal text-slate-500 block mt-0.5">
                  Hidden from public portal
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('COMING_SOON')}
                className={`p-2.5 rounded-lg border text-xs font-semibold text-left transition-all ${
                  status === 'COMING_SOON'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-500 font-bold'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>COMING SOON</span>
                </div>
                <span className="text-2xs font-normal text-slate-500 block mt-0.5">
                  Link is optional
                </span>
              </button>
            </div>
          </div>

          {/* Title & Category Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Portal Service Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="service-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Institutional Email Service"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Categorize Under Group <span className="text-rose-500">*</span>
              </label>
              <select
                id="service-group-select"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-slate-900"
              >
                {groups.map((grp) => (
                  <option key={grp.id} value={grp.id}>
                    {grp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Portal URL - Optional if Coming Soon */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Official Portal Web Link {status !== 'COMING_SOON' && <span className="text-rose-500">*</span>}
              </label>
              {status === 'COMING_SOON' && (
                <span className="text-2xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Optional for Coming Soon services
                </span>
              )}
            </div>
            <div className="relative">
              <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="service-portal-url-input"
                type="url"
                required={status !== 'COMING_SOON'}
                value={portalUrl}
                onChange={(e) => setPortalUrl(e.target.value)}
                placeholder={status === 'COMING_SOON' ? "Leave empty or enter preview link" : "https://portal.cu.ac.bd"}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Logo Section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-800">
                Service Logo (Landscape Ratio)
              </label>

              {/* Ratio Selector */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-600">Ratio:</span>
                {(['16:9', '2:1', '3:2'] as LogoRatio[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setLogoRatio(r)}
                    className={`px-2 py-0.5 rounded text-2xs font-medium transition-colors ${
                      logoRatio === r
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Mode Tabs */}
            <div className="flex border-b border-slate-200 gap-4 text-xs font-medium">
              <button
                type="button"
                id="tab-logo-url-btn"
                onClick={() => setLogoInputType('url')}
                className={`pb-1.5 transition-colors border-b-2 ${
                  logoInputType === 'url'
                    ? 'border-emerald-600 text-emerald-800 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Image Link (URL)
              </button>
              <button
                type="button"
                id="tab-logo-upload-btn"
                onClick={() => setLogoInputType('upload')}
                className={`pb-1.5 transition-colors border-b-2 ${
                  logoInputType === 'upload'
                    ? 'border-emerald-600 text-emerald-800 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Upload File from Device
              </button>
              <button
                type="button"
                id="tab-logo-preset-btn"
                onClick={() => setLogoInputType('preset')}
                className={`pb-1.5 transition-colors border-b-2 ${
                  logoInputType === 'preset'
                    ? 'border-emerald-600 text-emerald-800 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Generate CU Banner Preset
              </button>
            </div>

            {logoInputType === 'url' && (
              <div>
                <input
                  id="service-logo-url-input"
                  type="url"
                  value={logoUrl.startsWith('data:') ? '' : logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/portal-logo.png"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900 placeholder:text-slate-400"
                />
              </div>
            )}

            {logoInputType === 'upload' && (
              <div>
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl bg-white cursor-pointer transition-colors group">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 mb-1" />
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-700">
                    Click to select an image from your device
                  </span>
                  <input
                    id="service-logo-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {logoInputType === 'preset' && (
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBgColor('#064e3b');
                    applyPresetLogo('Student Gateway', '#064e3b,#022c22', '#34d399');
                  }}
                  className="p-2 text-left bg-white border border-slate-200 hover:border-emerald-400 rounded-lg text-2xs"
                >
                  <div className="h-6 w-full bg-emerald-900 rounded mb-1"></div>
                  <span className="font-semibold text-slate-700">Emerald Green</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBgColor('#0f172a');
                    applyPresetLogo('Administrative Portal', '#0f172a,#1e293b', '#38bdf8');
                  }}
                  className="p-2 text-left bg-white border border-slate-200 hover:border-sky-400 rounded-lg text-2xs"
                >
                  <div className="h-6 w-full bg-slate-900 rounded mb-1"></div>
                  <span className="font-semibold text-slate-700">Chittagong Navy</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBgColor('#312e81');
                    applyPresetLogo('Academic Records', '#312e81,#1e1b4b', '#a5b4fc');
                  }}
                  className="p-2 text-left bg-white border border-slate-200 hover:border-indigo-400 rounded-lg text-2xs"
                >
                  <div className="h-6 w-full bg-indigo-900 rounded mb-1"></div>
                  <span className="font-semibold text-slate-700">Indigo Deep</span>
                </button>
              </div>
            )}

            {/* Service Card Background Color Picker with Hex Support */}
            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <span>Card & Logo Background Color</span>
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs inline-block"
                    style={{ backgroundColor: bgColor }}
                  ></span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateColor(bgColor, true)}
                    className="text-2xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                    title="Apply current color to generated emblem banner"
                  >
                    Sync to Emblem
                  </button>
                  <span className="text-2xs font-mono text-slate-500 uppercase">{bgColor}</span>
                </div>
              </div>

              {/* Color Presets Palette */}
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 mb-2.5">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => handleUpdateColor(color.hex, true)}
                    className={`h-7 rounded-md border transition-all flex items-center justify-center relative ${
                      bgColor.toLowerCase() === color.hex.toLowerCase()
                        ? 'ring-2 ring-offset-1 ring-emerald-600 scale-105 z-10 border-white'
                        : 'border-slate-200/80 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={`${color.name} (${color.hex})`}
                  >
                    {bgColor.toLowerCase() === color.hex.toLowerCase() && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs"></span>
                    )}
                  </button>
                ))}
              </div>

              {/* Hex Code & Native Color Picker Input */}
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <input
                    id="service-color-picker"
                    type="color"
                    value={bgColor.startsWith('#') && bgColor.length === 7 ? bgColor : '#064e3b'}
                    onChange={(e) => handleUpdateColor(e.target.value, true)}
                    className="w-9 h-9 p-0.5 rounded-lg border border-slate-300 cursor-pointer bg-white"
                    title="Choose custom color from picker"
                  />
                </div>
                <div className="flex-1 relative">
                  <input
                    id="service-color-hex-input"
                    type="text"
                    value={bgColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBgColor(val);
                      if (/^#?[0-9A-Fa-f]{6}$/.test(val)) {
                        handleUpdateColor(val, true);
                      }
                    }}
                    onBlur={() => handleUpdateColor(bgColor, true)}
                    placeholder="#064e3b"
                    maxLength={7}
                    className="w-full text-xs font-mono py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <span className="text-2xs text-slate-500 whitespace-nowrap hidden sm:inline">
                  Pick color or enter 6-digit Hex
                </span>
              </div>
            </div>

            {logoUrl && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-2xs font-semibold text-slate-600 block mb-1">
                  Landscape ({logoRatio}) Preview:
                </span>
                <div
                  className={`w-full max-w-sm mx-auto ${
                    logoRatio === '2:1'
                      ? 'aspect-[2/1]'
                      : logoRatio === '3:2'
                      ? 'aspect-[3/2]'
                      : 'aspect-[16/9]'
                  } rounded-lg overflow-hidden border border-slate-300 shadow-2xs flex items-center justify-center`}
                  style={{ backgroundColor: bgColor }}
                >
                  <img
                    src={logoUrl}
                    alt="Logo Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Description with Strict 50-Word Limit */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Service Description (Max 50 words) <span className="text-rose-500">*</span>
              </label>
              <span
                id="word-count-badge"
                className={`text-2xs font-bold px-2 py-0.5 rounded ${
                  wordValidation.count > 50
                    ? 'bg-rose-100 text-rose-700'
                    : wordValidation.count > 40
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {wordValidation.count} / 50 words
              </span>
            </div>
            <textarea
              id="service-description-input"
              required
              rows={3}
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Brief explanation of what the portal offers, who can access it, and key instructions..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-slate-900 placeholder:text-slate-400"
            />
            <div className="flex items-center justify-between text-2xs text-slate-600 mt-1">
              <span>{wordValidation.remaining} words remaining</span>
              {wordValidation.isOverLimit && (
                <span className="text-rose-600 font-semibold">Exceeds 50 words limit!</span>
              )}
            </div>
          </div>

          {/* Additional Meta: Badge & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Badge Label (Optional)
              </label>
              <input
                id="service-badge-input"
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="e.g. Essential, 24/7, Popular"
                className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tags (Comma separated)
              </label>
              <input
                id="service-tags-input"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Email, Portal, Verification"
                className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            id="cancel-service-btn"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            id="save-service-submit-btn"
            onClick={handleSubmit}
            className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
          >
            {serviceToEdit ? 'Save Changes' : 'Publish Portal'}
          </button>
        </div>
      </div>
    </div>
  );
};
