document.addEventListener('DOMContentLoaded', () => {
  createSlider('#slider', {
    interval: 5000,
    swipeThreshold: 0.15,
    autoplay: true,
    showArrows: true,
    showDots: true,
    showPlayPause: true,
    pauseOnHover: true
  });
});