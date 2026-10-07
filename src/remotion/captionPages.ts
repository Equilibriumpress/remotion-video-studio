import {createTikTokStyleCaptions, type Caption, type TikTokPage} from '@remotion/captions';

export type CaptionSegment = {
  text: string;
  start: number;
  end: number;
  pageBreakAfter?: boolean;
};

const wordsForSegment = (segment: CaptionSegment) =>
  segment.text.trim().split(/\s+/).filter(Boolean);

export const captionTokensFromSegments = (
  segments: ReadonlyArray<CaptionSegment>,
): Caption[] => {
  const tokens: Caption[] = [];
  let tokenIndex = 0;

  for (const segment of segments) {
    const words = wordsForSegment(segment);
    const durationMs = Math.max(1, (segment.end - segment.start) * 1000);
    const weights = words.map((word) => Math.max(1, word.replace(/[^\p{L}\p{N}]/gu, '').length));
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0) || 1;
    let elapsedWeight = 0;

    words.forEach((word, index) => {
      const startMs = segment.start * 1000 + durationMs * (elapsedWeight / totalWeight);
      elapsedWeight += weights[index];
      const endMs = index === words.length - 1
        ? segment.end * 1000
        : segment.start * 1000 + durationMs * (elapsedWeight / totalWeight);

      tokens.push({
        text: tokenIndex === 0 ? word : ` ${word}`,
        startMs,
        endMs,
        timestampMs: null,
        confidence: null,
        ...(segment.pageBreakAfter && index === words.length - 1
          ? {pageBreakAfter: true}
          : {}),
      });
      tokenIndex++;
    });
  }

  return tokens;
};

export const captionPagesFromSegments = ({
  segments,
  combineTokensWithinMilliseconds,
  breakOnSilenceAfterMilliseconds,
}: {
  segments: ReadonlyArray<CaptionSegment>;
  combineTokensWithinMilliseconds: number;
  breakOnSilenceAfterMilliseconds?: number;
}): TikTokPage[] => {
  const captions = captionTokensFromSegments(segments);
  if (captions.length === 0) return [];

  return createTikTokStyleCaptions({
    captions,
    combineTokensWithinMilliseconds,
    breakOnSilenceAfterMilliseconds,
  }).pages;
};
