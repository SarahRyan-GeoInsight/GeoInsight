function showAbout() {
    var text = document.getElementById("aboutText");
    text.style.display = (text.style.display === "none") ? "block" : "none";
  }
viewer.scene.primitives.add(model);
// Initialize Cesium Viewer
const viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider: Cesium.createWorldTerrain()
});

// Define model position
const position = Cesium.Cartesian3.fromDegrees(28.2, -25.15, 0); // Lon, Lat, Height
const heading = Cesium.Math.toRadians(0);
const pitch = Cesium.Math.toRadians(0);
const roll = Cesium.Math.toRadians(0);

// Create orientation from heading, pitch, roll
const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
const modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr);

// Load GLTF/GLB model
const model = viewer.scene.primitives.add(
    Cesium.Model.fromGltf({
        url: 'C:\Users\silin\OneDrive\Desktop\Project\Cesium code\gmt 320.gltf', // Replace with your GLTF/GLB path
        modelMatrix: modelMatrix,
        scale: 1.0
    })
);
