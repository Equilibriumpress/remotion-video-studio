export const animateStyles = {
  'cut-paper': {background: '#F4DFC5', foreground: '#263A49', accent: '#C96152', secondary: '#E5A951', texture: 'layers'},
  crosshatch: {background: '#F0EADB', foreground: '#262D31', accent: '#B45B48', secondary: '#788C81', texture: 'hatch'},
  riso: {background: '#F2EDE0', foreground: '#28486A', accent: '#E45F52', secondary: '#7DAFA3', texture: 'dots'},
  sketchbook: {background: '#F8F1E3', foreground: '#363B3F', accent: '#CC7455', secondary: '#8D9F9A', texture: 'lines'},
  pixel: {background: '#16263B', foreground: '#F3E9C4', accent: '#FF9B61', secondary: '#78C7BA', texture: 'pixels'},
  math: {background: '#101F32', foreground: '#F4F6EB', accent: '#FFB95B', secondary: '#7ED4CB', texture: 'grid'},
  isometric: {background: '#F4EFE3', foreground: '#25354A', accent: '#D16D54', secondary: '#8BAAA4', texture: 'grid'},
} as const;
export type AnimateStyle = keyof typeof animateStyles;
