export const MAX_MAP_PLATE_DIMENSION = 3072;
export const MAX_MAP_CAMERA_ZOOM = 1.35;

export type WebGlProbe = {
  available: boolean;
  maxRenderbufferSize: number;
  maxTextureSize: number;
};

let cachedProbe: WebGlProbe | null = null;

export const probeWebGl = (): WebGlProbe => {
  if (cachedProbe) return cachedProbe;
  if (typeof document === 'undefined') {
    cachedProbe = {available: false, maxRenderbufferSize: 0, maxTextureSize: 0};
    return cachedProbe;
  }

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!gl) {
      cachedProbe = {available: false, maxRenderbufferSize: 0, maxTextureSize: 0};
      return cachedProbe;
    }

    const result = {
      available: true,
      maxRenderbufferSize: Number(gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) ?? 0),
      maxTextureSize: Number(gl.getParameter(gl.MAX_TEXTURE_SIZE) ?? 0),
    };
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    cachedProbe = result;
    return result;
  } catch {
    cachedProbe = {available: false, maxRenderbufferSize: 0, maxTextureSize: 0};
    return cachedProbe;
  }
};

export const mapPlateDimensions = ({
  width,
  height,
  follow,
  requestedZoom,
  webglLimit,
}: {
  width: number;
  height: number;
  follow: boolean;
  requestedZoom: number;
  webglLimit: number;
}) => {
  const compositionMax = Math.max(width, height);
  const safeLimit = Math.min(
    MAX_MAP_PLATE_DIMENSION,
    webglLimit > 0 ? webglLimit : MAX_MAP_PLATE_DIMENSION,
  );
  const supported = safeLimit >= compositionMax;
  const safeCameraZoom = Math.min(
    MAX_MAP_CAMERA_ZOOM,
    Math.max(1, requestedZoom),
  );
  const requestedScale = follow
    ? Math.max(1.35, safeCameraZoom + 0.25)
    : 1.12;
  const dimensionScale = supported ? safeLimit / compositionMax : 1;
  const plateScale = supported ? Math.min(requestedScale, dimensionScale) : 1;

  return {
    supported,
    safeCameraZoom,
    safeLimit,
    plateScale,
    plateWidth: Math.round(width * plateScale),
    plateHeight: Math.round(height * plateScale),
  };
};

export const canvasToObjectUrl = (canvas: HTMLCanvasElement) =>
  new Promise<string>((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('MapLibre snapshot returned an empty image'));
          return;
        }

        const url = URL.createObjectURL(blob);
        const image = new Image();
        image.onload = () => resolve(url);
        image.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('MapLibre snapshot could not be decoded'));
        };
        image.src = url;
      }, 'image/png');
    } catch (error) {
      reject(error);
    }
  });
