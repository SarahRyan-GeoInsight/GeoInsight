// main.js (ES module)
import Cesium from "https://cesium.com/downloads/cesiumjs/releases/1.134/Build/Cesium/Cesium.js";

(async function main() {
  // Put your Cesium Ion token here (or set via environment in production)
  Cesium.Ion.defaultAccessToken = 'YOUR_TOKEN_HERE';

  // Create viewer. NOTE: we do NOT add OSM 3D buildings.
  const viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider: Cesium.Terrain.fromWorldTerrain(), // optional; can use Ellipsoid if you don't want terrain
    timeline: false,
    animation: false,
    baseLayerPicker: true, // ok to show imagery selector
    infoBox: true,
    selectionIndicator: true,
  });

  // Fly to desired location (University of Pretoria example)
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(28.230834, -25.755833, 1000),
    orientation: {
      heading: Cesium.Math.toRadians(0.0),
      pitch: Cesium.Math.toRadians(-15.0),
    },
    duration: 2.5,
  });

  // Helper: load a GeoJSON and return the DataSource
  async function loadGeoJson(nameOrUrl, options = {}) {
    try {
      const ds = await Cesium.GeoJsonDataSource.load(nameOrUrl, options);
      viewer.dataSources.add(ds);
      return ds;
    } catch (e) {
      console.error("Failed to load", nameOrUrl, e);
      return null;
    }
  }

  // Paths to your QGIS-exported GeoJSON files (adjust filenames / paths)
  const files = {
    buildings: 'Buildings.geojson',
    roads: 'Main road.geojson',
    paths: 'paths.geojson',
    greens: 'Green spaces.geojson',
    lights: 'Lights.geojson',
    turnstiles: 'Entrances.geojson'
  };

  // Load each dataset (option: clampToGround for polylines; don't clamp if using terrain + extrusions)
  const ds_buildings = await loadGeoJson(files.buildings, { clampToGround: false });
  const ds_roads     = await loadGeoJson(files.roads,     { clampToGround: true  });
  const ds_paths     = await loadGeoJson(files.paths,     { clampToGround: true  });
  const ds_greens    = await loadGeoJson(files.greens,    { clampToGround: false });
  const ds_lights    = await loadGeoJson(files.lights,    { clampToGround: true  });
  const ds_turnst    = await loadGeoJson(files.turnstiles,{ clampToGround: true  });

  // Styling utilities -----------------------------------------------------

  // Style buildings: extrude polygon features using 'height' or 'levels' property.
  if (ds_buildings) {
    ds_buildings.entities.values.forEach(entity => {
      // Only process polygon geometries (GeoJSON polygons become entity.polygon)
      if (entity.polygon) {
        // Get properties from the original GeoJSON feature
        const props = entity.properties || {};
        // Common property names exported from QGIS might be 'height' (meters) or 'levels' (floors)
        let h = undefined;
        if (props.height && !isNaN(props.height)) {
          h = Number(props.height);
        } else if (props.levels && !isNaN(props.levels)) {
          h = Number(props.levels) * 3; // assume ~3m per floor
        } else if (props['building:levels'] && !isNaN(props['building:levels'])) {
          h = Number(props['building:levels']) * 3;
        } else {
          // fallback: small extrusion
          h = 6;
        }

        // Set extruded height and material
        entity.polygon.height = 0;
        entity.polygon.extrudedHeight = h;
        entity.polygon.material = Cesium.Color.fromCssColorString("#d9d0c7").withAlpha(1.0); // building color
        entity.polygon.outline = true;
        entity.polygon.outlineColor = Cesium.Color.BLACK.withAlpha(0.15);
        // optional: assign a label with building id or height for debugging
        entity.name = props.name || props.id || `Building ${entity.id}`;
        // place a tooltip label showing height when selected
        entity.description = `<table><tr><th>height</th><td>${h} m</td></tr></table>`;
      }
    });
  }

  // Style roads and paths: make polylines
  [ds_roads, ds_paths].forEach((ds, idx) => {
    if (!ds) return;
    ds.entities.values.forEach(entity => {
      // GeoJson polylines -> polyline entities
      if (entity.polyline) {
        entity.polyline.width = (idx === 0) ? 4 : 2; // thicker for roads
        entity.polyline.material = Cesium.Color.fromCssColorString(idx === 0 ? "#333333" : "#8b5e3c");
        entity.polyline.clampToGround = true;
        entity.name = entity.properties && (entity.properties.name || entity.properties.id) || 'Road/Path';
      }
      // If lines were imported as polygons (i.e., wide road footprints) they'll be polygons.
      if (entity.polygon) {
        entity.polygon.material = Cesium.Color.fromCssColorString("#e6e6e6");
        entity.polygon.outline = false;
      }
    });
  });

  // Style green spaces
  if (ds_greens) {
    ds_greens.entities.values.forEach(entity => {
      if (entity.polygon) {
        entity.polygon.material = Cesium.Color.fromCssColorString("#7BBF6A").withAlpha(0.6);
        entity.polygon.outline = false;
        entity.polygon.extrudedHeight = 0; // keep flat
      }
    });
  }

  // Lights and Turnstiles: show as billboards or small models
  // If your GeoJSON point features include coordinates at ground level, we clamp them to ground.
  const defaultLightImg = 'data:image/svg+xml;utf8,\
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">\
<circle cx="12" cy="12" r="8" fill="#ffd700"/></svg>';

  if (ds_lights) {
    ds_lights.entities.values.forEach(entity => {
      if (entity.billboard || entity.point) {
        // replace point with billboard for a simple icon
        const pos = entity.position;
        entity.billboard = new Cesium.BillboardGraphics({
          image: defaultLightImg,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          scale: 1.0,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        });
        // remove default point if present
        entity.point = undefined;
        entity.name = entity.properties && (entity.properties.id || entity.properties.name) || 'Light';
      }
    });
  }

  if (ds_turnst) {
    ds_turnst.entities.values.forEach(entity => {
      if (entity.billboard || entity.point) {
        // Example: use a small square icon (you can replace with a glTF model for realism)
        const svg = 'data:image/svg+xml;utf8,\
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18">\
<rect width="18" height="18" rx="3" ry="3" fill="#4b4bff"/></svg>';
        entity.billboard = new Cesium.BillboardGraphics({
          image: svg,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          scale: 1.0,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        });
        entity.point = undefined;
        entity.name = entity.properties && (entity.properties.id || entity.properties.name) || 'Turnstile';
      }
    });
  }

  // OPTIONAL: if you have glTF models for lights/turnstiles, create model entities like:
  // const modelEntity = viewer.entities.add({
  //   position: Cesium.Cartesian3.fromDegrees(lon, lat, heightOffset),
  //   model: { uri: 'turnstile.gltf', minimumPixelSize: 32, maximumScale: 20 }
  // });

  // Nice to have: group styling, toggle visibility from UI or console:
  window.myLayers = {
    buildings: ds_buildings,
    roads: ds_roads,
    paths: ds_paths,
    greens: ds_greens,
    lights: ds_lights,
    turnstiles: ds_turnst
  };

  console.log("Data sources loaded. Use window.myLayers to toggle visibility.");
})();
