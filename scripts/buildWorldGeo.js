const fs = require('fs');
const atlas = require('world-atlas/countries-110m.json');
const topojson = require('topojson-client');
const d3 = require('d3-geo');

const land = topojson.feature(atlas, atlas.objects.land);
const countries = topojson.feature(atlas, atlas.objects.countries);

// Equirectangular / Natural Earth projection fitted to 1000 x 500
const projection = d3.geoEquirectangular().fitSize([1000, 500], { type: 'Sphere' });
const pathGenerator = d3.geoPath().projection(projection);

const landPath = pathGenerator(land);

// Country features
const countryFeatures = countries.features.map(f => ({
  id: f.id,
  name: f.properties.name,
  path: pathGenerator(f)
})).filter(f => f.path);

const content = `// Cartographic Natural Earth world map vectors
export const WORLD_LAND_PATH = ${JSON.stringify(landPath)};

export interface CountryGeoPath {
  id?: string | number;
  name?: string;
  path: string;
}

export const WORLD_COUNTRIES: CountryGeoPath[] = ${JSON.stringify(countryFeatures)};

// Standard lon/lat to 1000x500 canvas projection
export function projectCoordinates(lon: number, lat: number): [number, number] {
  const x = (lon + 180) * (1000 / 360);
  const y = (90 - lat) * (500 / 180);
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}
`;

fs.mkdirSync('src/lib/geo', { recursive: true });
fs.writeFileSync('src/lib/geo/worldData.ts', content);
console.log('Successfully generated src/lib/geo/worldData.ts! Total land path length:', landPath.length);
