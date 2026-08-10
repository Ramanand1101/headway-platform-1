// Curated color palettes for the public marketing homepage (app/page.js,
// SiteHeader, SiteFooter). Picked from /admin/homepage, stored as
// content.themeKey. The role names (navy/blue/green) map 1:1 onto the
// site's original fixed Tailwind colors (ia-navy/ia-blue/ia-green) — a
// theme can repurpose a role's hue (e.g. "green" becomes gold in some
// presets) while keeping the same visual role in the layout.
export const homepageThemes = {
  'classic-navy': {
    label: 'Classic Navy & Blue',
    colors: {
      navy: '#0B1F3A',
      navy2: '#122B4E',
      navy3: '#0A1830',
      blue: '#2563EB',
      blueSoft: '#3B82F6',
      green: '#16A34A',
      greenSoft: '#22C55E'
    }
  },
  'emerald-teal': {
    label: 'Emerald Teal',
    colors: {
      navy: '#0B2B2B',
      navy2: '#123D3D',
      navy3: '#081E1E',
      blue: '#0D9488',
      blueSoft: '#14B8A6',
      green: '#65A30D',
      greenSoft: '#84CC16'
    }
  },
  'royal-indigo': {
    label: 'Royal Indigo',
    colors: {
      navy: '#1E1B4B',
      navy2: '#2E2A6B',
      navy3: '#14123A',
      blue: '#4F46E5',
      blueSoft: '#6366F1',
      green: '#D97706',
      greenSoft: '#F59E0B'
    }
  },
  'slate-amber': {
    label: 'Slate & Amber',
    colors: {
      navy: '#1F2937',
      navy2: '#374151',
      navy3: '#111827',
      blue: '#D97706',
      blueSoft: '#F59E0B',
      green: '#0D9488',
      greenSoft: '#14B8A6'
    }
  },
  'forest-gold': {
    label: 'Forest & Gold',
    colors: {
      navy: '#14261E',
      navy2: '#1E3A2C',
      navy3: '#0C1A14',
      blue: '#15803D',
      blueSoft: '#16A34A',
      green: '#CA8A04',
      greenSoft: '#EAB308'
    }
  },
  // Matches the InsuranceAdvise.in logo: deep navy + warm gold accent.
  'navy-gold': {
    label: 'Navy & Gold (Brand)',
    colors: {
      navy: '#0B1F3A',
      navy2: '#122B4E',
      navy3: '#0A1830',
      blue: '#C9972E',
      blueSoft: '#DDAE4E',
      green: '#16A34A',
      greenSoft: '#22C55E'
    }
  }
};

export function getHomepageTheme(key) {
  return homepageThemes[key] || homepageThemes['classic-navy'];
}

function hexToRgbTriplet(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

// Returns a style object for the homepage's root element: solid hex vars for
// plain fills/text/borders, plus space-separated RGB triplet vars for the
// spots that need `rgb(var(--x-rgb)/NN%)` alpha (Tailwind can't extract an
// alpha channel from an opaque var() reference at build time).
export function homepageThemeCssVars(theme) {
  const c = theme.colors;
  return {
    '--site-navy': c.navy,
    '--site-navy-2': c.navy2,
    '--site-navy-3': c.navy3,
    '--site-blue': c.blue,
    '--site-blue-soft': c.blueSoft,
    '--site-green': c.green,
    '--site-green-soft': c.greenSoft,
    '--site-navy-rgb': hexToRgbTriplet(c.navy),
    '--site-blue-rgb': hexToRgbTriplet(c.blue),
    '--site-green-rgb': hexToRgbTriplet(c.green)
  };
}
