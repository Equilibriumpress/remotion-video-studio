export type RenderProfile = 'draft' | 'standard';

export const renderProfiles: Record<RenderProfile, {label: string; scale: number; description: string}> = {
  draft: {
    label: 'Draft',
    scale: 0.5,
    description: 'Half-resolution test render',
  },
  standard: {
    label: 'Standard',
    scale: 1,
    description: 'Full project resolution',
  },
};
