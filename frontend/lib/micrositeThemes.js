// Curated theme presets for advisor microsites. Each preset bundles a
// color palette + font so combinations always look intentional — the
// advisor picks one from the dashboard instead of choosing raw hex values.
//
// `primaryTint`/`secondaryTint` are pre-mixed light backgrounds (not computed
// at runtime) so components can do `bg-[var(--tc-primary-tint)]` directly
// instead of needing CSS color-mix()/opacity tricks on arbitrary hex values.
export const micrositeThemes = {
  'charcoal-gold': {
    label: 'Charcoal & Gold',
    swatch: ['#1A1A1A', '#C9972B', '#475569'],
    font: { family: 'Manrope', google: 'Manrope:wght@500;600;700;800' },
    colors: {
      primary: '#C9972B',
      primaryDark: '#9C7412',
      primaryTint: '#FBF3E2',
      secondary: '#475569',
      secondaryTint: '#EEF1F4',
      dark: '#1A1A1A',
      darkAlt: '#262626'
    }
  },
  'navy-teal': {
    label: 'Navy & Teal',
    swatch: ['#0B1F3A', '#2E6B6B', '#16A34A'],
    font: { family: 'Poppins', google: 'Poppins:wght@500;600;700;800' },
    colors: {
      primary: '#2E6B6B',
      primaryDark: '#1F4F4F',
      primaryTint: '#E7F0F0',
      secondary: '#16A34A',
      secondaryTint: '#E7F7EC',
      dark: '#0B1F3A',
      darkAlt: '#122B4E'
    }
  },
  'saffron-classic': {
    label: 'Classic Saffron',
    swatch: ['#0B1F3A', '#FF7A00', '#1E8E3E'],
    font: { family: 'Poppins', google: 'Poppins:wght@500;600;700;800' },
    colors: {
      primary: '#FF7A00',
      primaryDark: '#E06900',
      primaryTint: '#FFF1E3',
      secondary: '#1E8E3E',
      secondaryTint: '#E9F7EE',
      dark: '#0B1F3A',
      darkAlt: '#12315C'
    }
  },
  'royal-blue': {
    label: 'Royal Blue',
    swatch: ['#0B1F3A', '#2563EB', '#16A34A'],
    font: { family: 'Inter', google: 'Inter:wght@500;600;700;800' },
    colors: {
      primary: '#2563EB',
      primaryDark: '#1D4ED8',
      primaryTint: '#EAF1FE',
      secondary: '#16A34A',
      secondaryTint: '#E7F7EC',
      dark: '#0B1F3A',
      darkAlt: '#122B4E'
    }
  },
  'forest-emerald': {
    label: 'Forest Emerald',
    swatch: ['#10241C', '#15803D', '#D97706'],
    font: { family: 'Inter', google: 'Inter:wght@500;600;700;800' },
    colors: {
      primary: '#15803D',
      primaryDark: '#0E6B3A',
      primaryTint: '#E7F6EC',
      secondary: '#D97706',
      secondaryTint: '#FDF0E1',
      dark: '#10241C',
      darkAlt: '#163529'
    }
  }
};

export const defaultThemeKey = 'charcoal-gold';

export function getMicrositeTheme(themeKey) {
  return micrositeThemes[themeKey] || micrositeThemes[defaultThemeKey];
}

// Builds the inline CSS custom properties for the microsite wrapper.
export function themeCssVars(theme) {
  const c = theme.colors;
  return {
    '--tc-primary': c.primary,
    '--tc-primary-dark': c.primaryDark,
    '--tc-primary-tint': c.primaryTint,
    '--tc-secondary': c.secondary,
    '--tc-secondary-tint': c.secondaryTint,
    '--tc-dark': c.dark,
    '--tc-dark-alt': c.darkAlt,
    fontFamily: `'${theme.font.family}', sans-serif`
  };
}
