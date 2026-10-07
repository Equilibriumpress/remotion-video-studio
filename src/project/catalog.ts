import demo from '../../projects/demo.json';
import travelDemo from '../../projects/travel-demo.json';
import renderTest from '../../projects/render-test.json';
import premiumMotionDemo from '../../projects/premium-motion-demo.json';
import kyotoPremiumShowcase from '../../projects/kyoto-premium-showcase.json';
import tokyoKyotoShinkansen from '../../projects/tokyo-kyoto-shinkansen.json';
import kyotoMorningRoute from '../../projects/kyoto-morning-route.json';
import kyotoAutoStory from '../../projects/kyoto-auto-story.json';
import kyotoPremiumDirector from '../../projects/kyoto-premium-director.json';
import scotlandRoadtripShowcase from '../../projects/scotland-roadtrip-showcase.json';
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
  parseProject(demo),
  parseProject(travelDemo),
  parseProject(renderTest),
  parseProject(premiumMotionDemo),
  parseProject(kyotoPremiumShowcase),
  parseProject(tokyoKyotoShinkansen),
  parseProject(kyotoMorningRoute),
  parseProject(kyotoAutoStory),
  parseProject(kyotoPremiumDirector),
  parseProject(scotlandRoadtripShowcase),
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
