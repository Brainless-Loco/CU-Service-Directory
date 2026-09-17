/**
 * ============================================================================
 * CU Services Portal - Typography & Font Configuration
 * Host Target: services.cu.ac.bd
 * ============================================================================
 * 
 * This file centralizes all font configurations for English and Bangla (বাংলা).
 * You can easily switch or customize fonts here without digging through CSS or components.
 * 
 * HOW TO CHANGE FONTS:
 * 1. To change English font: update `ENGLISH_PRIMARY_FONT` or choose from `ENGLISH_FONT_PRESETS`
 * 2. To change Bangla font: update `BANGLA_PRIMARY_FONT` or choose from `BANGLA_FONT_PRESETS`
 * 3. Update Google Fonts <link> in `/index.html` if you introduce a new external Google font.
 * 4. Update the corresponding CSS variables in `/src/fonts.css`.
 */

export interface FontDefinition {
  id: string;
  name: string;
  fontFamily: string;
  category: 'english' | 'bangla';
  description: string;
  googleFontQuery?: string;
}

/**
 * Currently Active Default Fonts
 */
export const ACTIVE_FONTS = {
  // English Primary Sans Font (used throughout the portal UI)
  englishSans: "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  
  // English Monospace Font (used for URLs, code, credentials, domain names)
  englishMono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",

  // Bangla Primary Sans Font (used for modern Bengali headlines & body text)
  banglaSans: "'Noto Sans Bengali', 'Hind Siliguri', 'SolaimanLipi', 'Siyam Rupali', sans-serif",

  // Bangla Serif / Formal Font (used for traditional university seal & official motto)
  banglaSerif: "'Noto Serif Bengali', 'Kalpurush', 'SolaimanLipi', serif",
};

/**
 * Curated Popular English Font Presets for Academic Portals
 */
export const ENGLISH_FONT_PRESETS: FontDefinition[] = [
  {
    id: 'plus-jakarta',
    name: 'Plus Jakarta Sans (Current Default)',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    category: 'english',
    description: 'Modern, high-legibility geometric sans crafted for academic and tech gateways',
    googleFontQuery: 'family=Plus+Jakarta+Sans:wght@400;500;600;700',
  },
  {
    id: 'inter',
    name: 'Inter',
    fontFamily: "'Inter', system-ui, sans-serif",
    category: 'english',
    description: 'Neutral, ultra-legible interface font designed specifically for computer screens',
    googleFontQuery: 'family=Inter:wght@400;500;600;700',
  },
  {
    id: 'outfit',
    name: 'Outfit',
    fontFamily: "'Outfit', system-ui, sans-serif",
    category: 'english',
    description: 'Contemporary geometric sans with friendly rounded curves',
    googleFontQuery: 'family=Outfit:wght@400;500;600;700',
  },
  {
    id: 'poppins',
    name: 'Poppins',
    fontFamily: "'Poppins', system-ui, sans-serif",
    category: 'english',
    description: 'Clean geometric sans with distinct character',
    googleFontQuery: 'family=Poppins:wght@400;500;600;700',
  },
  {
    id: 'roboto',
    name: 'Roboto',
    fontFamily: "'Roboto', system-ui, sans-serif",
    category: 'english',
    description: 'Google classic neo-grotesque sans with natural reading rhythm',
    googleFontQuery: 'family=Roboto:wght@400;500;700',
  },
  {
    id: 'lexend',
    name: 'Lexend',
    fontFamily: "'Lexend', system-ui, sans-serif",
    category: 'english',
    description: 'Scientifically engineered for maximum reading fluency and speed',
    googleFontQuery: 'family=Lexend:wght@400;500;600;700',
  },
  {
    id: 'open-sans',
    name: 'Open Sans',
    fontFamily: "'Open Sans', system-ui, sans-serif",
    category: 'english',
    description: 'Friendly, open letterforms with excellent readability across all screens',
    googleFontQuery: 'family=Open+Sans:wght@400;600;700',
  },
];

/**
 * Curated Popular Bangla (বাংলা) Font Presets
 */
export const BANGLA_FONT_PRESETS: FontDefinition[] = [
  {
    id: 'noto-sans-bengali',
    name: 'Noto Sans Bengali (Current Sans Default)',
    fontFamily: "'Noto Sans Bengali', 'SolaimanLipi', sans-serif",
    category: 'bangla',
    description: 'Google Noto project font with complete Bengali Unicode coverage and optimal readability',
    googleFontQuery: 'family=Noto+Sans+Bengali:wght@400;500;600;700',
  },
  {
    id: 'noto-serif-bengali',
    name: 'Noto Serif Bengali (Current Serif Default)',
    fontFamily: "'Noto Serif Bengali', 'Kalpurush', serif",
    category: 'bangla',
    description: 'Formal, dignified Bengali serif font for official titles, seals, and university mottos',
    googleFontQuery: 'family=Noto+Serif+Bengali:wght@500;600;700',
  },
  {
    id: 'hind-siliguri',
    name: 'Hind Siliguri',
    fontFamily: "'Hind Siliguri', 'SolaimanLipi', sans-serif",
    category: 'bangla',
    description: 'Open-source Bengali display typeface designed specifically for user interfaces',
    googleFontQuery: 'family=Hind+Siliguri:wght@400;500;600;700',
  },
  {
    id: 'kalpurush',
    name: 'Kalpurush / Siyam Rupali',
    fontFamily: "'Kalpurush', 'Siyam Rupali', 'SolaimanLipi', serif",
    category: 'bangla',
    description: 'Popular elegant Bengali font with classic aesthetic curves and diacritic balance',
  },
  {
    id: 'solaiman-lipi',
    name: 'SolaimanLipi / System Fallback',
    fontFamily: "'SolaimanLipi', 'Siyam Rupali', 'Kalpurush', sans-serif",
    category: 'bangla',
    description: 'The golden standard classical Bengali typography found on Bangladeshi government portals',
  },
  {
    id: 'tiro-bangla',
    name: 'Tiro Bangla',
    fontFamily: "'Tiro Bangla', 'Noto Serif Bengali', serif",
    category: 'bangla',
    description: 'High-contrast formal editorial font with traditional calligraphic character',
    googleFontQuery: 'family=Tiro+Bangla:ital@0;1',
  },
  {
    id: 'galada',
    name: 'Galada',
    fontFamily: "'Galada', cursive, sans-serif",
    category: 'bangla',
    description: 'Expressive stylized Bengali script for badges, cultural notices, and celebratory headers',
    googleFontQuery: 'family=Galada',
  },
];

const STORAGE_KEY_FONT_SETTINGS = 'cu_portal_font_settings_v3';

/**
 * Dynamically injects Google Font link into document head if not already present
 */
export const ensureGoogleFontLoaded = (googleQuery?: string) => {
  if (typeof document === 'undefined' || !googleQuery) return;
  const linkId = `gfont-${googleQuery.replace(/[^a-zA-Z0-9]/g, '-')}`;
  if (document.getElementById(linkId)) return;

  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?${googleQuery}&display=swap`;
  document.head.appendChild(link);
};

/**
 * Get active font settings from localStorage or defaults
 */
export const getStoredFontSettings = (): { englishFontId: string; banglaFontId: string } => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FONT_SETTINGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      const englishId = parsed.englishPresetId || parsed.englishFontId;
      const banglaId = parsed.banglaPresetId || parsed.banglaFontId;
      if (englishId && banglaId) {
        return { englishFontId: englishId, banglaFontId: banglaId };
      }
    }
  } catch (e) {
    console.error('Failed to read stored font settings', e);
  }
  return {
    englishFontId: 'plus-jakarta',
    banglaFontId: 'noto-sans-bengali',
  };
};

/**
 * Load persisted font settings compatible with PortalFontSettings
 */
export const loadPersistedFonts = () => {
  const stored = getStoredFontSettings();
  return {
    englishPresetId: stored.englishFontId,
    banglaPresetId: stored.banglaFontId,
    englishFontId: stored.englishFontId,
    banglaFontId: stored.banglaFontId,
    lastUpdated: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Persist font settings into localStorage
 */
export const persistFontSettings = (settings: { englishPresetId?: string; banglaPresetId?: string; englishFontId?: string; banglaFontId?: string }) => {
  try {
    const englishId = settings.englishPresetId || settings.englishFontId || 'plus-jakarta';
    const banglaId = settings.banglaPresetId || settings.banglaFontId || 'noto-sans-bengali';
    localStorage.setItem(
      STORAGE_KEY_FONT_SETTINGS,
      JSON.stringify({
        englishPresetId: englishId,
        banglaPresetId: banglaId,
        englishFontId: englishId,
        banglaFontId: banglaId,
        updatedAt: new Date().toISOString(),
      })
    );
  } catch (e) {
    console.error('Failed to save font settings', e);
  }
};

/**
 * Dynamically apply font choices to the portal root element in real-time
 */
export const applyFontsGlobally = (
  englishFontIdOrSettings: string | { englishPresetId?: string; banglaPresetId?: string; englishFontId?: string; banglaFontId?: string },
  optionalBanglaFontId?: string
): void => {
  if (typeof document === 'undefined') return;

  let englishFontId = 'plus-jakarta';
  let banglaFontId = 'noto-sans-bengali';

  if (typeof englishFontIdOrSettings === 'object' && englishFontIdOrSettings !== null) {
    englishFontId = englishFontIdOrSettings.englishPresetId || englishFontIdOrSettings.englishFontId || 'plus-jakarta';
    banglaFontId = englishFontIdOrSettings.banglaPresetId || englishFontIdOrSettings.banglaFontId || optionalBanglaFontId || 'noto-sans-bengali';
  } else if (typeof englishFontIdOrSettings === 'string') {
    englishFontId = englishFontIdOrSettings;
    banglaFontId = optionalBanglaFontId || 'noto-sans-bengali';
  }

  const englishPreset = ENGLISH_FONT_PRESETS.find((p) => p.id === englishFontId) || ENGLISH_FONT_PRESETS[0];
  const banglaPreset = BANGLA_FONT_PRESETS.find((p) => p.id === banglaFontId) || BANGLA_FONT_PRESETS[0];

  // Dynamically load Google Font links
  if (englishPreset.googleFontQuery) {
    ensureGoogleFontLoaded(englishPreset.googleFontQuery);
  }
  if (banglaPreset.googleFontQuery) {
    ensureGoogleFontLoaded(banglaPreset.googleFontQuery);
  }

  // Update root CSS variables instantly
  const root = document.documentElement;
  root.style.setProperty('--font-english', englishPreset.fontFamily);
  root.style.setProperty('--font-bangla-sans', banglaPreset.fontFamily);

  // Save in localStorage for all visits
  try {
    localStorage.setItem(
      STORAGE_KEY_FONT_SETTINGS,
      JSON.stringify({
        englishFontId,
        banglaFontId,
        updatedAt: new Date().toISOString(),
      })
    );
  } catch (e) {
    console.error('Failed to save font settings', e);
  }
};

/**
 * Sample test phrases for typography verification
 */
export const FONT_SAMPLES = {
  english: {
    title: 'University of Chittagong Central Services Portal',
    subtitle: 'Access academic, administrative, and student portals via services.cu.ac.bd',
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789',
  },
  bangla: {
    title: 'চট্টগ্রাম বিশ্ববিদ্যালয় কেন্দ্রীয় সেবা পোর্টাল',
    subtitle: 'শিক্ষার্থী, শিক্ষক ও কর্মকর্তাদের জন্য ওয়ান-স্টপ ডিজিটাল সার্ভিসেস',
    alphabet: 'অ আ ই ঈ উ ঊ ঋ এ ঐ ও ঔ ক খ গ ঘ ঙ চ ছ জ ঝ ঞ ট ঠ ড ঢ ণ ত থ দ ধ ন প ফ ব ভ ম য র ল শ ষ স হ ড় ঢ় য়',
    motto: 'আমাদের উদ্দেশ্য জ্ঞান বিতরণ ও সত্যের সন্ধান',
  },
};
