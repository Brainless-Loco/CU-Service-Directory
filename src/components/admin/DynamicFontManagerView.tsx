import React, { useState } from 'react';
import {
  Type,
  Check,
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import {
  ENGLISH_FONT_PRESETS,
  BANGLA_FONT_PRESETS,
  applyFontsGlobally,
  loadPersistedFonts,
  persistFontSettings,
} from '../../config/fonts';
import { PortalFontSettings } from '../../types';

interface DynamicFontManagerViewProps {
  currentSettings: PortalFontSettings;
  onUpdateSettings: (settings: PortalFontSettings) => void;
}

export const DynamicFontManagerView: React.FC<DynamicFontManagerViewProps> = ({
  currentSettings,
  onUpdateSettings,
}) => {
  const [selectedEnglish, setSelectedEnglish] = useState(currentSettings.englishPresetId);
  const [selectedBangla, setSelectedBangla] = useState(currentSettings.banglaPresetId);
  const [testTextEn, setTestTextEn] = useState('Chittagong University Central Services Gateway 2026');
  const [testTextBn, setTestTextBn] = useState('চট্টগ্রাম বিশ্ববিদ্যালয় কেন্দ্রীয় সেবা পোর্টাল (services.cu.ac.bd)');
  const [testFontSize, setTestFontSize] = useState(18);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const activeEnglishPreset = ENGLISH_FONT_PRESETS.find((p) => p.id === selectedEnglish) || ENGLISH_FONT_PRESETS[0];
  const activeBanglaPreset = BANGLA_FONT_PRESETS.find((p) => p.id === selectedBangla) || BANGLA_FONT_PRESETS[0];

  const handleApplyFonts = () => {
    const newSettings: PortalFontSettings = {
      englishPresetId: selectedEnglish,
      banglaPresetId: selectedBangla,
      lastUpdated: new Date().toISOString(),
    };

    // Apply globally to DOM CSS variables and dynamically inject Google Font link if necessary
    applyFontsGlobally(selectedEnglish, selectedBangla);
    persistFontSettings(newSettings);
    onUpdateSettings(newSettings);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleResetDefaults = () => {
    setSelectedEnglish('plus-jakarta-sans');
    setSelectedBangla('hind-siliguri');
    const defaultSettings: PortalFontSettings = {
      englishPresetId: 'plus-jakarta-sans',
      banglaPresetId: 'hind-siliguri',
      lastUpdated: new Date().toISOString(),
    };
    applyFontsGlobally('plus-jakarta-sans', 'hind-siliguri');
    persistFontSettings(defaultSettings);
    onUpdateSettings(defaultSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Apply Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Dynamic Portal Typography Manager</span>
              <span className="text-2xs font-mono bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                Admin Dynamic Control
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Switch English and Bangla fonts dynamically from the Admin Panel without modifying code files.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Reset Defaults
          </button>

          <button
            id="admin-apply-fonts-btn"
            onClick={handleApplyFonts}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply & Save Globally</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-semibold shadow-2xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold">Portal Fonts Successfully Updated & Persisted!</p>
            <p className="text-2xs text-emerald-700 mt-0.5">
              Active: English ({activeEnglishPreset.name}) • Bangla ({activeBanglaPreset.name}). Changes applied globally across the portal.
            </p>
          </div>
        </div>
      )}

      {/* Font Selectors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. English Font Selection */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              1. English Font Family Stack
            </span>
            <span className="text-2xs font-mono text-slate-500">--font-english</span>
          </div>

          <h4 className="text-base font-bold text-slate-900 mb-1">
            Selected: {activeEnglishPreset.name}
          </h4>
          <p className="text-xs text-slate-500 mb-4">
            Used for headings, service card titles, navigation labels, and buttons.
          </p>

          <div className="space-y-2">
            {ENGLISH_FONT_PRESETS.map((preset) => {
              const isSelected = selectedEnglish === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => setSelectedEnglish(preset.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900" style={{ fontFamily: preset.fontFamily }}>
                        {preset.name}
                      </span>
                      <span className="text-3xs font-mono uppercase bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-700">
                        {preset.category}
                      </span>
                    </div>
                    <p className="text-2xs text-slate-500 font-mono mt-0.5 truncate max-w-[260px]">
                      {preset.fontFamily}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Bangla Font Selection */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              2. Bangla Font Family Stack (বাংলা)
            </span>
            <span className="text-2xs font-mono text-slate-500">--font-bangla-sans</span>
          </div>

          <h4 className="text-base font-bold text-slate-900 mb-1">
            Selected: {activeBanglaPreset.name}
          </h4>
          <p className="text-xs text-slate-500 mb-4">
            Used for Bengali text descriptions, university notices, and notices banner.
          </p>

          <div className="space-y-2">
            {BANGLA_FONT_PRESETS.map((preset) => {
              const isSelected = selectedBangla === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => setSelectedBangla(preset.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50/50 ring-1 ring-sky-500'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900" style={{ fontFamily: preset.fontFamily }}>
                        {preset.name}
                      </span>
                      <span className="text-3xs font-mono uppercase bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-700">
                        {preset.category}
                      </span>
                    </div>
                    <p className="text-2xs text-slate-500 font-mono mt-0.5 truncate max-w-[260px]">
                      {preset.fontFamily}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Live Sandbox Preview */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Real-Time Typography Sandbox & Scale Comparison</span>
            </h4>
            <p className="text-xs text-slate-500">
              Live preview reflecting the currently selected candidate fonts above.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <span className="text-2xs font-semibold text-slate-500 px-2">Size:</span>
            {[14, 16, 18, 22, 26].map((size) => (
              <button
                key={size}
                onClick={() => setTestFontSize(size)}
                className={`px-2 py-0.5 text-xs font-semibold rounded transition-colors ${
                  testFontSize === size ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {size}px
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* English Sandbox */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              English Font: {activeEnglishPreset.name}
            </label>
            <input
              type="text"
              value={testTextEn}
              onChange={(e) => setTestTextEn(e.target.value)}
              className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
              placeholder="Type English text to test..."
            />
            <div
              className="p-3 bg-white rounded-lg border border-slate-200 text-slate-900 leading-normal break-words"
              style={{ fontSize: `${testFontSize}px`, fontFamily: activeEnglishPreset.fontFamily }}
            >
              {testTextEn || 'Sample English text'}
            </div>
            <span className="text-3xs text-slate-500 block font-mono">
              Font stack: {activeEnglishPreset.fontFamily}
            </span>
          </div>

          {/* Bangla Sandbox */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Bangla Font: {activeBanglaPreset.name} (বাংলা)
            </label>
            <input
              type="text"
              value={testTextBn}
              onChange={(e) => setTestTextBn(e.target.value)}
              className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500"
              placeholder="বাংলা টেক্সট লিখুন..."
            />
            <div
              className="p-3 bg-white rounded-lg border border-slate-200 text-slate-900 leading-normal break-words"
              style={{ fontSize: `${testFontSize}px`, fontFamily: activeBanglaPreset.fontFamily }}
            >
              {testTextBn || 'নমুনা বাংলা টেক্সট'}
            </div>
            <span className="text-3xs text-slate-500 block font-mono">
              Font stack: {activeBanglaPreset.fontFamily}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
