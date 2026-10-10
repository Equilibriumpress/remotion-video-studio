/** Decodes the exported MP4 on the same device to catch corrupt/empty containers. */
export async function verifyExport(blob: Blob, expectedSeconds: number): Promise<{bytes: number; seconds: number; width: number; height: number}> {
  if (blob.size < 8192) throw new Error('MP4 export is suspiciously small');
  const url = URL.createObjectURL(blob);
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.muted = true;
  video.src = url;
  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error('MP4 metadata decode timed out')), 20000);
      video.onloadedmetadata = () => {window.clearTimeout(timeout); resolve();};
      video.onerror = () => {window.clearTimeout(timeout); reject(new Error('MP4 failed media decoding'));};
      video.load();
    });
    if (!Number.isFinite(video.duration) || Math.abs(video.duration - expectedSeconds) > Math.max(1.5, expectedSeconds * .05)) {
      throw new Error('MP4 duration differs from the timeline');
    }
    if (video.videoWidth < 1 || video.videoHeight < 1) throw new Error('MP4 has no decodable video stream');
    return {bytes: blob.size, seconds: video.duration, width: video.videoWidth, height: video.videoHeight};
  } finally {
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(url);
  }
}
