import demo from '../../projects/demo.json';
import historyOfAi from '../../projects/animate-history-of-ai.json';
import heatPumpExplainer from '../../projects/animate-heat-pump-explainer.json';
import animateShowcase0 from '../../projects/animate-kyoto-in-layers.json';
import animateShowcase1 from '../../projects/animate-tokyo-through-time.json';
import animateShowcase2 from '../../projects/animate-how-a-shinkansen-works.json';
import animateShowcase3 from '../../projects/animate-build-a-city.json';
import animateShowcase4 from '../../projects/animate-pixel-tokyo.json';
import animateShowcase5 from '../../projects/animate-mathematics-of-motion.json';
import animateTokyo from '../../projects/animate-tokyo-isometric.json';
import animateKyoto from '../../projects/animate-kyoto-sketchbook.json';
import animateMath from '../../projects/animate-math-city.json';
import travelDemo from '../../projects/travel-demo.json';
import renderTest from '../../projects/render-test.json';
import premiumMotionDemo from '../../projects/premium-motion-demo.json';
import kyotoPremiumShowcase from '../../projects/kyoto-premium-showcase.json';
import tokyoKyotoShinkansen from '../../projects/tokyo-kyoto-shinkansen.json';
import kyotoMorningRoute from '../../projects/kyoto-morning-route.json';
import kyotoTravelReel from '../../projects/kyoto-travel-reel.json';
import kyotoAutoStory from '../../projects/kyoto-auto-story.json';
import kyotoPremiumDirector from '../../projects/kyoto-premium-director.json';
import scotlandRoadtripShowcase from '../../projects/scotland-roadtrip-showcase.json';
import peakDistrictRoadtrip from '../../projects/peak-district-roadtrip.json';
import originalNordicRoutes from '../../projects/roller-skis-original-nordic-routes.json';
import originalLowerThird from '../../projects/roller-skis-original-lower-third.json';
import peakDistrictYouTubeLongform from '../../projects/peak-district-youtube-longform.json';
import peakDistrictAssetFree from '../../projects/peak-district-asset-free-youtube.json';
import bitcoinExplainedReference from '../../projects/bitcoin-explained-svg-showcase.json';
import mapLibreRouteDemo from '../../projects/maplibre-route-demo.json';
import threeGlobeFlightDemo from '../../projects/three-globe-flight-demo.json';
import studioProductShowcase from '../../projects/studio-product-showcase.json';
import captionStylesShowcase from '../../projects/caption-styles-showcase.json';
import audioReactiveShowcase from '../../projects/audio-reactive-showcase.json';
import threeVehicleShowcase from '../../projects/three-vehicle-showcase.json';
import pereLachaiseAppStoreHeader from '../../projects/perelachaise-appstore-header.json';
import pereLachaiseAppStoreSearch from '../../projects/perelachaise-appstore-search.json';
import {parseProject, type VideoProject} from './schema';

export const projects: VideoProject[] = [
  parseProject(historyOfAi),
  parseProject(heatPumpExplainer),
  parseProject(animateShowcase0),
  parseProject(animateShowcase1),
  parseProject(animateShowcase2),
  parseProject(animateShowcase3),
  parseProject(animateShowcase4),
  parseProject(animateShowcase5),
  parseProject(animateTokyo),
  parseProject(animateKyoto),
  parseProject(animateMath),
  parseProject(demo),
  parseProject(travelDemo),
  parseProject(renderTest),
  parseProject(premiumMotionDemo),
  parseProject(kyotoPremiumShowcase),
  parseProject(tokyoKyotoShinkansen),
  parseProject(kyotoMorningRoute),
  parseProject(kyotoTravelReel),
  parseProject(kyotoAutoStory),
  parseProject(kyotoPremiumDirector),
  parseProject(scotlandRoadtripShowcase),
  parseProject(peakDistrictRoadtrip),
  parseProject(originalNordicRoutes),
  parseProject(originalLowerThird),
  parseProject(peakDistrictYouTubeLongform),
  parseProject(peakDistrictAssetFree),
  parseProject(bitcoinExplainedReference),
  parseProject(mapLibreRouteDemo),
  parseProject(threeGlobeFlightDemo),
  parseProject(studioProductShowcase),
  parseProject(captionStylesShowcase),
  parseProject(audioReactiveShowcase),
  parseProject(threeVehicleShowcase),
  parseProject(pereLachaiseAppStoreHeader),
  parseProject(pereLachaiseAppStoreSearch),
];

export const getProject = (id: string) =>
  projects.find((project) => project.id === id) ?? projects[0];
