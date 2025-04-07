export const isMobile = () => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const aspectRatio = viewportWidth / viewportHeight;
  return aspectRatio < 1.2;
}; 