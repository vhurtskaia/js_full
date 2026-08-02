

class Slider {
  /**
   * @property {string[]} images         
   * @property {number}   interval       
   * @property {boolean}  showArrows    
   * @property {boolean}  showIndicators 
   * @property {boolean}  loop          
   * @property {boolean}  autoplay      
   * @property {number}   dragThreshold 
   * @property {boolean}  pauseOnHover   
   */
  static get defaults() {
    return {
      images: [],
      interval: 3000,
      showArrows: true,
      showIndicators: true,
      loop: true,
      autoplay: true,
      dragThreshold: 40,
      pauseOnHover: true
    };
  }

  /**
   * @param {HTMLElement} container 
   * @param {Object} config 
   */
  constructor(container, config) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('Slider: container має бути DOM-елементом');
    }

    this.container = container;
    this.config = Object.assign({}, Slider.defaults, config || {});
    this.state = {
      current: 0,
      total: this.config.images.length,
      playing: false,
      timer: null
    };
    this.dom = {};
    this._wasPlayingBeforeHover = false;

    this._buildDOM();
    this._bindControlEvents();
    this._bindKeyboardEvents();
    this._bindHoverEvents();
    this.render();

    if (this.config.autoplay) this.play();
  }


  _buildDOM() {
    const container = this.container;
    container.classList.add('cs-slider');
    container.innerHTML = '';

    const viewport = document.createElement('div');
    viewport.className = 'cs-viewport';

    const track = document.createElement('div');
    track.className = 'cs-track';

    this.config.images.forEach((src) => {
      const slide = document.createElement('div');
      slide.className = 'cs-slide';

      const img = document.createElement('img');
      img.src = src;
      img.alt = 'Фото котика';
      img.draggable = false;

      slide.appendChild(img);
      track.appendChild(slide);
    });

    viewport.appendChild(track);
    container.appendChild(viewport);

    const controls = document.createElement('div');
    controls.className = 'cs-controls';

    let prevBtn = null;
    let nextBtn = null;

    if (this.config.showArrows) {
      prevBtn = document.createElement('button');
      prevBtn.className = 'cs-btn cs-prev';
      prevBtn.textContent = '‹';
      prevBtn.setAttribute('aria-label', 'Попередній слайд');
      controls.appendChild(prevBtn);
    }

    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'cs-dots';
    if (this.config.showIndicators) {
      this.config.images.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'cs-dot';
        dot.dataset.index = i;
        dot.setAttribute('aria-label', `Слайд ${i + 1}`);
        dotsWrap.appendChild(dot);
      });
    }
    controls.appendChild(dotsWrap);

    const playBtn = document.createElement('button');
    playBtn.className = 'cs-btn cs-play';
    playBtn.textContent = 'пауза';
    controls.appendChild(playBtn);

    if (this.config.showArrows) {
      nextBtn = document.createElement('button');
      nextBtn.className = 'cs-btn cs-next';
      nextBtn.textContent = '›';
      nextBtn.setAttribute('aria-label', 'Наступний слайд');
      controls.appendChild(nextBtn);
    }

    container.appendChild(controls);

    this.dom = { viewport, track, prevBtn, nextBtn, playBtn, dotsWrap };
  }


  _bindControlEvents() {
    if (this.dom.nextBtn) {
      this.dom.nextBtn.addEventListener('click', () => {
        this.next();
        this._restartIfPlaying();
      });
    }
    if (this.dom.prevBtn) {
      this.dom.prevBtn.addEventListener('click', () => {
        this.prev();
        this._restartIfPlaying();
      });
    }

    this.dom.playBtn.addEventListener('click', () => this.toggle());

    if (this.config.showIndicators) {
      this.dom.dotsWrap.addEventListener('click', (e) => {
        const dot = e.target.closest('.cs-dot');
        if (!dot) return;
        this.goTo(Number(dot.dataset.index));
        this._restartIfPlaying();
      });
    }
  }

  _bindKeyboardEvents() {
    this._onKeydown = (e) => {
      if (e.key === 'ArrowRight') { this.next(); this._restartIfPlaying(); }
      if (e.key === 'ArrowLeft') { this.prev(); this._restartIfPlaying(); }
      if (e.key === ' ') { e.preventDefault(); this.toggle(); }
    };
    document.addEventListener('keydown', this._onKeydown);
  }

  _bindHoverEvents() {
    if (!this.config.pauseOnHover) return;

    this.container.addEventListener('mouseenter', () => {
      this._wasPlayingBeforeHover = this.state.playing;
      if (this.state.playing) this.pause();
    });

    this.container.addEventListener('mouseleave', () => {
      if (this._wasPlayingBeforeHover) this.play();
    });
  }

  _restartIfPlaying() {
    if (this.state.playing) this.play();
  }


  render() {
    this.dom.track.style.transform = `translateX(-${this.state.current * 100}%)`;

    if (this.config.showIndicators) {
      [...this.dom.dotsWrap.children].forEach((dot, i) => {
        dot.classList.toggle('active', i === this.state.current);
      });
    }

    this.dom.playBtn.textContent = this.state.playing ? 'пауза' : 'відтворити';
  }

  goTo(index) {
    const total = this.state.total;
    this.state.current = this.config.loop
      ? (index + total) % total
      : Math.max(0, Math.min(index, total - 1));
    this.render();
  }

  next() { this.goTo(this.state.current + 1); }
  prev() { this.goTo(this.state.current - 1); }

  play() {
    this.state.playing = true;
    clearInterval(this.state.timer);
    this.state.timer = setInterval(() => this.next(), this.config.interval);
    this.render();
  }

  pause() {
    this.state.playing = false;
    clearInterval(this.state.timer);
    this.render();
  }

  toggle() {
    this.state.playing ? this.pause() : this.play();
  }


  destroy() {
    clearInterval(this.state.timer);
    document.removeEventListener('keydown', this._onKeydown);
    this.container.innerHTML = '';
  }
}


class TouchSlider extends Slider {
  constructor(container, config) {
    super(container, config);
    this._bindDragEvents();
  }

  _bindDragEvents() {
    const viewport = this.dom.viewport;
    let startX = 0;
    let dx = 0;
    let dragging = false;

    viewport.addEventListener('pointerdown', (e) => {
      dragging = true;
      startX = e.clientX;
      dx = 0;
      this.dom.track.classList.add('no-anim');
      this.pause();
    });

    viewport.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      dx = e.clientX - startX;
      const percent = (dx / viewport.clientWidth) * 100;
      this.dom.track.style.transform =
        `translateX(calc(-${this.state.current * 100}% + ${percent}%))`;
    });

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      this.dom.track.classList.remove('no-anim');

      if (dx > this.config.dragThreshold) this.prev();
      else if (dx < -this.config.dragThreshold) this.next();
      else this.render();

      dx = 0;
    };

    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointerleave', endDrag);
  }
}
