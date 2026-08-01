const createSlider = (rootSelector, userOptions = {}) => {
  const defaultOptions = {
    interval: 4000,
    swipeThreshold: 0.15
  };

  const options = {...defaultOptions, ...userOptions};

  const root = typeof rootSelector === 'string'
    ? document.querySelector(rootSelector)
    : rootSelector;

  if (!root) {
    throw new Error('Slider not found');
  }

  const track = root.querySelector('.slider__track');
  const slides = Array.from(track.children);
  const dotsContainer = root.querySelector('#dots, .slider__dots');
  const prevBtn = root.querySelector('#prevBtn, .slider__btn--prev');
  const nextBtn = root.querySelector('#nextBtn, .slider__btn--next');
  const playPauseBtn = root.querySelector('#playPauseBtn, .slider__play');

  const total = slides.length;

  const state = {
    current: 0,
    isDragging: false,
    isPlaying: true,
    startX: 0,
    timerId: null,
    wasPlayingBeforeDrag: false
  };
  const normalizeIndex = (index) => ((index % total) + total) % total;

  const getPositionX = (event) =>
    event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;

  const renderTrackPosition = () => {
    track.style.transform = `translateX(-${state.current * 100}%)`;
  };

  const renderActiveSlide = () => {
    slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === state.current);
    });
  };

  const renderActiveDot = () => {
    if (!dotsContainer) return;
    Array.from(dotsContainer.children).forEach((dot, index) => {
      dot.classList.toggle('active', index === state.current);
    });
  };

  const render = () => {
    renderTrackPosition();
    renderActiveSlide();
    renderActiveDot();
  };

  const createDots = () => {
    if (!dotsContainer) return;

    dotsContainer.innerHTML = '';

    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slider__dot';

      if (index === state.current) {
        dot.classList.add('active');
      }

      dot.addEventListener('click', () => goToSlide(index));
      dotsContainer.appendChild(dot);
    });
  };

  const goToSlide = (index) => {
    state.current = normalizeIndex(index);
    render();
  };

  const nextSlide = () => goToSlide(state.current + 1);

  const prevSlide = () => goToSlide(state.current - 1);

  const stopAutoplay = () => {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
  };

  const updatePlayPauseButton = () => {
    if (!playPauseBtn) return;
    playPauseBtn.textContent = state.isPlaying ? 'Pause' : 'Play';
    playPauseBtn.setAttribute('aria-pressed', String(!state.isPlaying));
  };

  const startAutoplay = () => {
    stopAutoplay();
    state.timerId = setInterval(nextSlide, options.interval);
    state.isPlaying = true;
    updatePlayPauseButton();
  };

  const pauseAutoplay = () => {
    stopAutoplay();
    state.isPlaying = false;
    updatePlayPauseButton();
  };

  const togglePlay = () => {
    state.isPlaying ? pauseAutoplay() : startAutoplay();
  };

  const handleKeydown = (event) => {
    if (event.key === 'ArrowLeft') {
      prevSlide();
    } else if (event.key === 'ArrowRight') {
      nextSlide();
    }
  };

  const dragStart = (event) => {
    state.isDragging = true;
    state.startX = getPositionX(event);
    state.wasPlayingBeforeDrag = state.isPlaying;

    root.classList.add('dragging');
    track.style.transition = 'none';

    if (state.isPlaying) {
      pauseAutoplay();
    }
  };

  const dragMove = (event) => {
    if (!state.isDragging) return;

    if (event.type === 'touchmove') {
      event.preventDefault();
    }

    const currentX = getPositionX(event);
    const deltaX = currentX - state.startX;
    const deltaPercent = (deltaX / track.clientWidth) * 100;

    track.style.transform = `translateX(calc(-${state.current * 100}% + ${deltaPercent}%))`;
  };

  const dragEnd = (event) => {
    if (!state.isDragging) return;

    state.isDragging = false;
    root.classList.remove('dragging');
    track.style.transition = '';

    const endX = event.type.includes('mouse')
      ? event.pageX
      : (event.changedTouches ? event.changedTouches[0].clientX : state.startX);

    const deltaX = endX - state.startX;
    const threshold = track.clientWidth * options.swipeThreshold;

    if (deltaX > threshold) {
      prevSlide();
    } else if (deltaX < -threshold) {
      nextSlide();
    } else {
      render();
    }

    if (state.wasPlayingBeforeDrag) {
      startAutoplay();
    }
  };

  const bindEvents = () => {
    prevBtn && prevBtn.addEventListener('click', () => {
      prevSlide();
      restartAutoplayIfNeeded();
    });

    nextBtn && nextBtn.addEventListener('click', () => {
      nextSlide();
      restartAutoplayIfNeeded();
    });

    playPauseBtn && playPauseBtn.addEventListener('click', togglePlay);

    root.addEventListener('keydown', handleKeydown);
    root.setAttribute('tabindex', '0');

    track.addEventListener('mousedown', dragStart);
    window.addEventListener('mousemove', dragMove);
    window.addEventListener('mouseup', dragEnd);
    track.addEventListener('mouseleave', (event) => {
      if (state.isDragging) dragEnd(event);
    });

    track.addEventListener('touchstart', dragStart, {passive: true});
    track.addEventListener('touchmove', dragMove, {passive: false});
    track.addEventListener('touchend', dragEnd);

    track.addEventListener('dragstart', (event) => event.preventDefault());

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAutoplay();
      } else if (state.isPlaying) {
        startAutoplay();
      }
    });
  };

  const restartAutoplayIfNeeded = () => {
    if (state.isPlaying) startAutoplay();
  };

  const init = () => {
    if (total === 0) return;

    createDots();
    render();
    bindEvents();
    startAutoplay();
  };

  init();

  return {
    destroy: stopAutoplay,
    goTo: (index) => {
      goToSlide(index);
      restartAutoplayIfNeeded();
    },
    next: () => {
      nextSlide();
      restartAutoplayIfNeeded();
    },
    pause: pauseAutoplay,
    play: startAutoplay,
    prev: () => {
      prevSlide();
      restartAutoplayIfNeeded();
    }
  };
};