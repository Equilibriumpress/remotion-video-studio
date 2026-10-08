import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {VideoProject, VideoScene} from '../../project/schema';

type BitcoinScene = Extract<VideoScene, {type: 'bitcoin-explainer'}>;
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

/**
 * Independently authored, deterministic SVG Bitcoin explainer.
 * Conceptual sequence references Shimmy0530/btc-explained, not its code.
 * No external font, network, assets, DOM measurement, or WebGL required.
 */
export const BitcoinExplainerSceneFrame = ({
  scene,
  project,
}: {
  scene: BitcoinScene;
  project: VideoProject;
}) => {
  const frame = useCurrentFrame();
  const {width: w, height: h, fps} = useVideoConfig();
  const bg = project.theme.background;
  const fg = project.theme.foreground;
  const muted = project.theme.muted;
  const accent = project.theme.accent;
  const second = '#F7B86C';
  const k = Math.min(1, frame / (fps * 1.3));
  const entrance = interpolate(k, [0, 1], [0, 1], clamp);
  const wave = (frame % (fps * 7)) / (fps * 7);
  const pulse = 0.72 + 0.28 * Math.sin(frame / fps * Math.PI * 1.4);
  const text = (x: number, y: number, value: string, size: number, color = fg, anchor: 'start' | 'middle' | 'end' = 'middle', weight = 700) => (
    <text x={x} y={y} fill={color} fontSize={size} fontWeight={weight}
      textAnchor={anchor} fontFamily="Arial, Helvetica, sans-serif">{value}</text>
  );
  const node = (x: number, y: number, label: string, i: number, active = false) => (
    <g key={i}>
      <circle cx={x} cy={y} r={w * (active ? 0.030 : 0.026)}
        fill={bg} stroke={active ? second : accent} strokeWidth={w * 0.0026}
        opacity={0.88 * entrance} />
      <circle cx={x} cy={y} r={w * 0.007}
        fill={active ? second : accent} opacity={pulse} />
      {text(x, y + h * 0.068, label, w * 0.017, muted)}
    </g>
  );
  const line = (x1: number, y1: number, x2: number, y2: number, id: string, glow = false) => (
    <line key={id} x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={glow ? second : accent} strokeWidth={w * (glow ? 0.0034 : 0.0016)}
      opacity={0.28 + 0.46 * entrance} strokeDasharray={glow ? undefined : '11 9'}
      strokeDashoffset={glow ? undefined : -frame * 0.32} />
  );
  const card = (cx: number, cy: number, heading: string, subtitle: string, color = accent, size = 0.235) => {
    const cw = w * size, ch = h * 0.19;
    return (
      <g>
        <rect x={cx - cw / 2} y={cy - ch / 2} width={cw} height={ch}
          rx={w * 0.013} fill="#172338" stroke={color} strokeWidth={2} opacity={entrance} />
        {text(cx, cy - h * 0.009, heading, w * 0.027, fg)}
        {text(cx, cy + h * 0.042, subtitle, w * 0.016, muted, 'middle', 500)}
      </g>
    );
  };
  const packet = (x1: number, y1: number, x2: number, y2: number, progress = wave) => (
    <circle cx={x1 + (x2 - x1) * progress} cy={y1 + (y2 - y1) * progress}
      r={w * 0.008} fill={second} stroke={bg} strokeWidth={3} />
  );

  const positions = [
    [0.19, 0.37], [0.39, 0.34], [0.61, 0.34], [0.81, 0.37],
    [0.27, 0.66], [0.50, 0.58], [0.73, 0.66],
  ] as const;
  const links: [number, number][] = [[0, 1], [1, 2], [2, 3], [0, 4], [1, 5], [2, 5], [3, 6], [4, 5], [5, 6]];
  const chain = Array.from({length: 6}, (_, index) => ({
    x: w * (0.16 + index * 0.135),
    y: h * 0.51,
  }));
  const chapters = ['Network', 'Keys', 'Signing', 'Broadcast', 'Blocks', 'Depth', 'Evidence', 'Takeaways'];
  let graphic: React.ReactNode = null;

  switch (scene.mode) {
    case 'network':
    case 'broadcast': {
      const isBroadcast = scene.mode === 'broadcast';
      graphic = (
        <g>
          {links.map(([a, b], i) => line(positions[a][0] * w, positions[a][1] * h,
            positions[b][0] * w, positions[b][1] * h, String(i), isBroadcast && i % 3 === 0))}
          {positions.map(([x, y], i) => node(x * w, y * h, isBroadcast ? `PEER ${i + 1}` : `NODE ${i + 1}`, i, isBroadcast && i === 5))}
          {isBroadcast ? (
            <>
              {[0, 1, 2].map(i => (
                <circle key={i} cx={w * 0.5} cy={h * 0.58}
                  r={w * (0.04 + ((wave + i / 3) % 1) * 0.3)}
                  fill="none" stroke={second} strokeWidth={2}
                  opacity={0.36 * (1 - ((wave + i / 3) % 1))} />
              ))}
              {text(w * 0.5, h * 0.80, 'A valid transaction spreads between peers', w * 0.022, muted)}
            </>
          ) : (
            <>
              {packet(w * 0.19, h * 0.37, w * 0.39, h * 0.34)}
              {packet(w * 0.61, h * 0.34, w * 0.73, h * 0.66, (wave + 0.33) % 1)}
              {text(w * 0.5, h * 0.80, 'No central server manages every connection', w * 0.022, muted)}
            </>
          )}
        </g>
      );
      break;
    }
    case 'wallets':
      graphic = (
        <g>
          {line(w * 0.34, h * 0.51, w * 0.66, h * 0.51, 'wallet')}
          {card(w * 0.25, h * 0.51, 'PRIVATE KEY', 'Keep secret', second)}
          {card(w * 0.75, h * 0.51, 'ADDRESS', 'Share to receive', accent)}
          {packet(w * 0.35, h * 0.51, w * 0.65, h * 0.51)}
          {text(w * 0.5, h * 0.76, 'Wallets manage keys, not physical coins', w * 0.024, muted)}
        </g>
      );
      break;
    case 'transaction':
      graphic = (
        <g>
          {line(w * 0.28, h * 0.51, w * 0.72, h * 0.51, 'transaction', true)}
          {card(w * 0.18, h * 0.51, 'SENDER', 'Authorizes transfer', accent, 0.21)}
          {card(w * 0.5, h * 0.51, 'SIGNATURE', 'Proves authorization', second, 0.21)}
          {card(w * 0.82, h * 0.51, 'RECIPIENT', 'New output', accent, 0.21)}
          {packet(w * 0.29, h * 0.51, w * 0.71, h * 0.51)}
          {text(w * 0.5, h * 0.79, 'Digital signatures authorize spending', w * 0.023, muted)}
        </g>
      );
      break;
    case 'blockchain':
    case 'confirmations': {
      const confirmed = scene.mode === 'confirmations';
      const count = confirmed ? Math.min(6, Math.floor(frame / (fps * 9)) + 1) : 6;
      graphic = (
        <g>
          {chain.slice(1).map((b, i) => line(chain[i].x + w * 0.052, b.y, b.x - w * 0.052, b.y, `c-${i}`, true))}
          {chain.map((b, i) => {
            const included = i < count;
            return (
              <g key={i} opacity={included ? entrance : 0.18}>
                <rect x={b.x - w * 0.056} y={b.y - h * 0.12} width={w * 0.112} height={h * 0.24}
                  rx={w * 0.008} fill="#142137" stroke={i === count - 1 ? second : accent} strokeWidth={3} />
                {text(b.x, b.y - h * 0.018, `BLOCK ${i + 1}`, w * 0.019, fg)}
                {text(b.x, b.y + h * 0.045, included ? 'VERIFIED' : 'PENDING', w * 0.013, muted)}
              </g>
            );
          })}
          {text(w * 0.5, h * 0.79,
            confirmed ? `Confirmations illustrated: ${count}` : 'Each block links to earlier history',
            w * 0.024, muted)}
        </g>
      );
      break;
    }
    case 'investigation':
      graphic = (
        <g>
          {links.map(([a, b], i) => line(positions[a][0] * w, positions[a][1] * h,
            positions[b][0] * w, positions[b][1] * h, `inv-${i}`, i === 4 || i === 5))}
          {positions.map(([x, y], i) => node(x * w, y * h, i % 2 ? 'OUTPUT' : 'ADDRESS', i, i === 5))}
          {packet(w * 0.39, h * 0.34, w * 0.5, h * 0.58)}
          {text(w * 0.5, h * 0.82, 'A transaction link is not proof of identity', w * 0.023, muted)}
        </g>
      );
      break;
    case 'takeaway':
      graphic = (
        <g>
          {card(w * 0.2, h * 0.5, 'PUBLIC', 'Shared ledger', accent, 0.25)}
          {card(w * 0.5, h * 0.5, 'KEYS', 'Spending authority', second, 0.25)}
          {card(w * 0.8, h * 0.5, 'TRACEABLE', 'Verify before attributing', accent, 0.25)}
          {text(w * 0.5, h * 0.78, 'Transactions are visible; people require corroboration', w * 0.022, muted)}
        </g>
      );
      break;
  }
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
      <rect width={w} height={h} fill={bg} />
      {Array.from({length: 9}, (_, i) => (
        <line key={i} x1={w * 0.07} y1={h * (0.28 + i * 0.068)}
          x2={w * 0.93} y2={h * (0.28 + i * 0.068)}
          stroke={accent} opacity={0.04} />
      ))}
      <line x1={w * 0.075} y1={h * 0.11} x2={w * 0.925} y2={h * 0.11}
        stroke={accent} opacity={0.5} />
      <text x={w * 0.075} y={h * 0.087} fill={accent}
        fontSize={w * 0.014} fontWeight={800} letterSpacing={w * 0.0014}
        fontFamily="Arial, Helvetica, sans-serif">{(scene.kicker ?? 'BITCOIN EXPLAINED').toUpperCase()}</text>
      <text x={w * 0.075} y={h * 0.208} fill={fg}
        fontSize={w * 0.048} fontWeight={850} opacity={entrance}
        fontFamily="Arial, Helvetica, sans-serif">{scene.title}</text>
      {graphic}
      <rect x={w * 0.075} y={h * 0.905} width={w * 0.85} height={4}
        fill={accent} opacity={0.14} />
      <rect x={w * 0.075} y={h * 0.905} width={w * 0.85 * frame / (fps * 60)}
        height={4} fill={second} />
      {text(w * 0.92, h * 0.95, chapters[['network', 'wallets', 'transaction', 'broadcast', 'blockchain', 'confirmations', 'investigation', 'takeaway'].indexOf(scene.mode)].toUpperCase(), w * 0.012, muted, 'end', 700)}
    </svg>
  );
};
