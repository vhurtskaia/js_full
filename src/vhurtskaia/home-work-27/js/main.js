document.addEventListener('DOMContentLoaded', () => {
  createSlider('#slider', {
    interval: 5000,
    swipeThreshold: 0.15
  });
});