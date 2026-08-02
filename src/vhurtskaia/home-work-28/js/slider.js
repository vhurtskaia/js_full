class Slider {
  static defaultOptions = {
    interval: 4000,
    swipeThreshold: 0.15,
    autoplay: true,
    showArrows: true,
    showDots: true,
    showPlayPause: true,
    pauseOnHover: true
  };

  #options;
  #root;
  #track;
  #slides;
  #total;
  #current = 0;
  #isPlaying = false;
  #timerId = null;

  #prevBtn = null;
  #nextBtn = null;
  #playPauseBtn = null;
  #dotsContainer = null;

  /**
   * @param {string|HTMLElement} rootSelector
   * @param {Object} [userOptions]
   */
  constructor(rootSelector, userOptions = {}) {
    this.#options = { ...Slider.defaultOptions, ...userOptions };

    this.#root = typeof rootSelector === 'string'
      ? document.querySelector(rootSelector)
      : rootSelector;

    if (!this.#root) {
      throw new Error('Slider: кореневий елемент не знайдено');
    }

    this.#track = this.#root.querySelector('.slider__track');
    this.#slides = Array.from(this.#track.children);
    this.#total = this.#slides.length;

    this._init();
  }

  get root() { return this.#root; }
  get track() { return this.#track; }
  get slides() { return this.#slides; }
  get total() { return this.#total; }
  get current() { return this.#current; }
  get options() { return this.#options; }
  get isPlaying() { return this.#isPlaying; }

  _init() {
    if (this.#total === 0) return;

    this._createControls();
    this._render();
    this._bindEvents();

    if (this.#options.autoplay) this.play();
  }

  _normalizeIndex(index) {
    return ((index % this.#total) + this.#total) % this.#total;
  }

  _createControls() {
    if (this.#options.showArrows) {
      this.#prevBtn = this._createButton('slider__btn slider__btn--prev', '&#10094;', 'Previous slide');
      this.#nextBtn = this._createButton('slider__btn slider__btn--next', '&#10095;', 'Next slide');
      this.#root.append(this.#prevBtn, this.#nextBtn);
    }

    const controlsWrapper = document.createElement('div');
    controlsWrapper.className = 'slider__controls';

    if (this.#options.showPlayPause) {
      this.#playPauseBtn = this._createButton('slider__play', 'Pause', 'Play or pause slideshow');
      controlsWrapper.append(this.#playPauseBtn);
    }

    if (this.#options.showDots) {
      this.#dotsContainer = document.createElement('div');
      this.#dotsContainer.className = 'slider__dots';
      this._createDots();
      controlsWrapper.append(this.#dotsContainer);
    }

    this.#root.append(controlsWrapper);
  }

  _createButton(className, html, ariaLabel) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.innerHTML = html;
    button.setAttribute('aria-label', ariaLabel);
    return button;
  }

  _createDots() {
    this.#dotsContainer.innerHTML = '';

    this.#slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slider__dot';
      dot.setAttribute('aria-label', `Перейти до слайду ${index + 1}`);

      if (index === this.#current) dot.classList.add('active');

      dot.addEventListener('click', () => this.goTo(index));
      this.#dotsContainer.append(dot);
    });
  }

  _render() {
    this.#track.style.transform = `translateX(-${this.#current * 100}%)`;

    this.#slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === this.#current);
    });

    if (this.#dotsContainer) {
      Array.from(this.#dotsContainer.children).forEach((dot, index) => {
        dot.classList.toggle('active', index === this.#current);
      });
    }
  }

  goTo(index) {
    this.#current = this._normalizeIndex(index);
    this._render();
    this._restartAutoplayIfNeeded();
  }

  next() { this.goTo(this.#current + 1); }
  prev() { this.goTo(this.#current - 1); }

  play() {
    this._stopTimer();
    this.#timerId = setInterval(() => this.goTo(this.#current + 1), this.#options.interval);
    this.#isPlaying = true;
    this._updatePlayPauseButton();
  }

  pause() {
    this._stopTimer();
    this.#isPlaying = false;
    this._updatePlayPauseButton();
  }

  togglePlay() {
    this.#isPlaying ? this.pause() : this.play();
  }

  destroy() {
    this._stopTimer();
  }

  _stopTimer() {
    if (this.#timerId) {
      clearInterval(this.#timerId);
      this.#timerId = null;
    }
  }

  _restartAutoplayIfNeeded() {
    if (this.#isPlaying) this.play();
  }

  _updatePlayPauseButton() {
    if (!this.#playPauseBtn) return;
    this.#playPauseBtn.textContent = this.#isPlaying ? 'Pause' : 'Play';
  }

  _bindEvents() {
    this.#prevBtn?.addEventListener('click', () => this.prev());
    this.#nextBtn?.addEventListener('click', () => this.next());
    this.#playPauseBtn?.addEventListener('click', () => this.togglePlay());

    this.#root.setAttribute('tabindex', '0');
    this.#root.addEventListener('keydown', (event) => this._handleKeydown(event));

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this._stopTimer();
      } else if (this.#isPlaying) {
        this.play();
      }
    });

    if (this.#options.pauseOnHover) {
      this._bindHoverPause();
    }
  }

  _handleKeydown(event) {
    if (event.key === 'ArrowLeft') this.prev();
    if (event.key === 'ArrowRight') this.next();
  }

  _bindHoverPause() {
    let wasPlayingBeforeHover = false;

    this.#root.addEventListener('mouseenter', () => {
      wasPlayingBeforeHover = this.#isPlaying;
      if (this.#isPlaying) this.pause();
    });

    this.#root.addEventListener('mouseleave', () => {
      if (wasPlayingBeforeHover) this.play();
    });
  }
}

class DraggableSlider extends Slider {
  isDragging = false;
  startX = 0;
  wasPlayingBeforeDrag = false;

  _bindEvents() {
    super._bindEvents();
    this._bindDragEvents();
  }

  _getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
  }

  _dragStart(event) {
    this.isDragging = true;
    this.startX = this._getPositionX(event);
    this.wasPlayingBeforeDrag = this.isPlaying;

    this.root.classList.add('dragging');
    this.track.style.transition = 'none';

    if (this.isPlaying) this.pause();
  }

  _dragMove(event) {
    if (!this.isDragging) return;

    if (event.type === 'touchmove') event.preventDefault();

    const currentX = this._getPositionX(event);
    const deltaX = currentX - this.startX;
    const deltaPercent = (deltaX / this.track.clientWidth) * 100;

    this.track.style.transform = `translateX(calc(-${this.current * 100}% + ${deltaPercent}%))`;
  }

  _dragEnd(event) {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.root.classList.remove('dragging');
    this.track.style.transition = '';

    const endX = event.type.includes('mouse')
      ? event.pageX
      : (event.changedTouches ? event.changedTouches[0].clientX : this.startX);

    const deltaX = endX - this.startX;
    const threshold = this.track.clientWidth * this.options.swipeThreshold;

    if (deltaX > threshold) {
      this.prev();
    } else if (deltaX < -threshold) {
      this.next();
    } else {
      this._render();
    }

    if (this.wasPlayingBeforeDrag) this.play();
  }

  _bindDragEvents() {
    const onStart = (event) => this._dragStart(event);
    const onMove = (event) => this._dragMove(event);
    const onEnd = (event) => this._dragEnd(event);

    this.track.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    this.track.addEventListener('mouseleave', (event) => {
      if (this.isDragging) onEnd(event);
    });

    this.track.addEventListener('touchstart', onStart, { passive: true });
    this.track.addEventListener('touchmove', onMove, { passive: false });
    this.track.addEventListener('touchend', onEnd);
    this.track.addEventListener('dragstart', (event) => event.preventDefault());
  }
}

function createSlider(rootSelector, options) {
  return new DraggableSlider(rootSelector, options);
}