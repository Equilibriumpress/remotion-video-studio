import {animateStyles} from './styles';

export function AnimateStyleGuide() {
  return <details style={{marginTop: 16, padding: 14, border: '1px solid #66708555', borderRadius: 12}}>
    <summary style={{cursor: 'pointer', fontWeight: 700}}>Animation style guide · 7 palettes</summary>
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginTop: 14}}>
      {Object.entries(animateStyles).map(([name, palette]) => (
        <div key={name} style={{border: '1px solid #66708555', borderRadius: 8, padding: 10}}>
          <strong style={{textTransform: 'capitalize'}}>{name}</strong>
          <div style={{display: 'flex', marginTop: 8, height: 30, overflow: 'hidden', borderRadius: 5}}>
            {[palette.background, palette.foreground, palette.accent, palette.secondary].map(color => <span key={color} title={color} style={{flex: 1, background: color}} />)}
          </div>
          <small style={{display: 'block', marginTop: 8}}>Texture: {palette.texture}</small>
        </div>
      ))}
    </div>
  </details>;
}
