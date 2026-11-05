// PageBackground is managed globally at the root in App.jsx via GlobalShaderBackground.
// This component is kept as a lightweight no-op to maintain backwards compatibility without duplicate WebGL canvases.
function PageBackground() {
  return null;
}

export default PageBackground;
