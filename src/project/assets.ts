export const resolveAsset = (src: string) => {
  if (/^https?:\/\//.test(src) || src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }

  const base = import.meta.env.BASE_URL;
  return `${base}${src.replace(/^\//, '')}`;
};
