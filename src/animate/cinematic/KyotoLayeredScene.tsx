import {AbsoluteFill,useCurrentFrame,useVideoConfig} from 'remotion';
import {kyotoArtLayers,type KyotoArtShot} from './svg-art/KyotoArtwork';
import {KyotoSvgMotion} from './KyotoSvgMotion';
import {KyotoAtmosphere} from './KyotoAtmosphere';
export function KyotoLayeredScene({shot,duration}:{shot:KyotoArtShot;duration:number}){
 const frame=useCurrentFrame(),{fps}=useVideoConfig();const p=Math.min(1,frame/Math.max(1,Math.round(duration*fps)-1));
 const layers=kyotoArtLayers(shot);
 const push=shot==='lantern'?.06:shot==='pagoda'?.035:shot==='teahouse'?.018:.048;
 return <AbsoluteFill style={{background:'#141f35',overflow:'hidden'}}>
 <svg width="100%" height="100%" viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice">
 <defs><linearGradient id="kyoto-sky" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#111a31"/><stop offset=".55" stopColor="#2a314b"/><stop offset="1" stopColor="#6b4752"/></linearGradient></defs>
 <rect width="1080" height="1920" fill="url(#kyoto-sky)"/>
 {layers.map((layer,i)=><g key={i} transform={`translate(${(p-.5)*(-75)*layer.depth} ${(p-.5)*(-45)*layer.depth}) translate(540 960) scale(${1+p*push*layer.depth}) translate(-540 -960)`}>{layer.art}</g>)}
 <KyotoSvgMotion shot={shot} progress={p}/>
 <KyotoAtmosphere progress={p} amount={shot==='teahouse'?80:50}/>
 <g textAnchor="middle" fill="#fff2df" fontFamily="Georgia, serif" fontWeight="600" fontSize="37" opacity={Math.min(1,p*7,(1-p)*8)}><text x="540" y="1530">{{alley:'KYOTO AFTER SUNSET',lantern:'PAPER. LIGHT. SILENCE.',pagoda:'THE CITY UNFOLDS',teahouse:'A QUIETER MOMENT',panorama:'KYOTO AFTER DARK'}[shot]}</text></g>
 </svg>
 </AbsoluteFill>;
}
