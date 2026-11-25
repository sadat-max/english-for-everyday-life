export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    fontFamily: { sans: ['Inter', 'Cairo', 'system-ui', 'sans-serif'], ar: ['Cairo', 'Tahoma', 'sans-serif'] },
    // Higher-contrast greys (navy-tinted) so supporting text never looks washed out.
    colors: { slate: { 50: '#F4F8FF', 100: '#E9F0FB', 200: '#D6E3F6', 300: '#B9CCEA', 400: '#64748B', 500: '#475569', 600: '#334155', 700: '#1E2A47', 800: '#0F1B3A', 900: '#08142F', 950: '#050D22' } },
    boxShadow: { card: '0 5px 18px rgba(32,75,145,.10), 0 0 12px rgba(0,153,255,.08), inset 0 1px 2px rgba(255,255,255,.95)' },
  } },
  plugins: [],
};
