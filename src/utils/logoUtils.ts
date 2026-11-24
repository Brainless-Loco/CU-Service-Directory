const escapeXml = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

export const createLandscapeLogoSvg = (
  title: string,
  subtitle: string,
  bgGradient: string,
  accentColor: string,
): string => {
  const [startColor, endColor = startColor] = bgGradient.split(',').map((color) => color.trim());
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">
    <defs>
      <linearGradient id="background" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${escapeXml(startColor || '#064e3b')}" />
        <stop offset="100%" stop-color="${escapeXml(endColor || '#022c22')}" />
      </linearGradient>
    </defs>
    <rect width="640" height="360" fill="url(#background)" />
    <circle cx="54" cy="48" r="7" fill="${escapeXml(accentColor || '#38bdf8')}" />
    <text x="40" y="190" fill="#ffffff" font-size="30" font-family="sans-serif" font-weight="700">${escapeXml(title)}</text>
    <text x="40" y="235" fill="#ffffff" fill-opacity="0.85" font-size="16" font-family="sans-serif">${escapeXml(subtitle)}</text>
    <rect x="40" y="310" width="120" height="4" rx="2" fill="${escapeXml(accentColor || '#38bdf8')}" />
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
