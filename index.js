(function () {
  'use strict';

  var DEFAULT_WIDTH = 320;

  var elStyle = function (el, prop, v) {
    if (el) {
      el.style[prop] = v;
    }
  };

  var isPortraitModeFn = function () {
    return window.innerHeight > window.innerWidth;
  };

  var switchUI = function (isPortraitMode) {
    document.querySelector('.mode--portrait').classList.toggle('hidden', !isPortraitMode);
    document.querySelector('.mode--landscape').classList.toggle('hidden', isPortraitMode);
  };

  var resizeCb = function (adContainer) {
    var isPortraitMode = isPortraitModeFn();
    switchUI(isPortraitMode);
    if (!isPortraitMode) {
      elStyle(adContainer, 'width', '100%');
    }
    slider.updateSlidesWidth();
    slider.resetTapeOffset();
  };

  var closeCb = function () {
    document.querySelector('.wrapper').remove();
    window.removeEventListener('resize', resizeCb);
  };

  var sliderTouchstart = function (e) {
    var x = (e.changedTouches && e.changedTouches[0].clientX) || e.pageX;
    slider.cacheCoords(x);
  };

  var sliderTouchend = function (e) {
    var x = (e.changedTouches && e.changedTouches[0].clientX) || e.pageX;
    slider.slide(x);
  };

  // var adjustContainer = function (container, isPortraitMode) {
  //   var banner = document.querySelector('.ad__banner');
  //   banner.addEventListener('load', function (e) {
  //     if (isPortraitMode) {
  //       elStyle(container, 'width', e.currentTarget.clientWidth + 'px');
  //     }
  //     elStyle(container, 'opacity', 1);
  //   });
  //   banner.addEventListener('error', function () {
  //     if (isPortraitMode) {
  //       elStyle(container, 'width', DEFAULT_WIDTH + 'px');
  //     }
  //     elStyle(container, 'opacity', 1);
  //   });
  //   banner.setAttribute('src', './banner.jpg');
  // };

  var slider = {
    cache: {},
    currentSlideIndex: 0,
    cacheCoords: function (x) {
      this.cache.x = x;
    },
    shouldSlide: function (x) {
      var delta = x - this.cache.x;
      var xAbs = Math.abs(delta);
      return [xAbs > 10, delta];
    },
    performSlide: function (delta) {
      this.updateSlideIndex(delta);
      this.performUISlide();
    },
    performUISlide: function () {
      var slideWidth = this.tape.parentElement.clientWidth;
      this.tape.style.left = -(this.currentSlideIndex * slideWidth) + 'px';
    },
    updateSlideIndex: function (delta) {
      if (delta < 0 && this.canSlide('forward')) {
        this.currentSlideIndex += 1;
      } else if (delta > 0 && this.canSlide('backward')) {
        this.currentSlideIndex -= 1;
      }
    },
    slide: function (x) {
      var shouldSlideRes = this.shouldSlide(x);
      var shouldSlide = shouldSlideRes[0];
      var delta = shouldSlideRes[1];
      if (shouldSlide) {
        this.performSlide(delta);
      }
    },
    getSlideNodes: function () {
      return Array.prototype.slice.call(this.tape.children);
    },
    getSlideNodesCount: function () {
      return this.getSlideNodes().length;
    },
    setSlidesCount: function () {
      this.slidesCount = this.getSlideNodesCount();
    },
    setTape: function () {
      this.tape = this.el.querySelector('.slider__tape');
    },
    init: function (el) {
      this.el = el;
      this.setTape();
      this.setSlidesCount();
      this.updateSlidesWidth();
    },
    resetTapeOffset: function () {
      this.tape.style.left = 0;
    },
    updateSlidesWidth: function () {
      var slideNodes = this.getSlideNodes();
      slideNodes.forEach(function (slide) {
        slide.style.width = '';
      }.bind(this));
      slideNodes.forEach(function (slide) {
        slide.style.width = this.el.clientWidth + 'px';
      }.bind(this));
    },
    canSlide: function (_case) {
      if (_case === 'backward') {
        return this.currentSlideIndex > 0;
      }
      return this.currentSlideIndex < this.slidesCount - 1;
    }
  };

  document.ondragstart = function () {
    return false;
  };

  document.addEventListener('DOMContentLoaded', function () {
    var adContainer = document.querySelector('.ad__container');
    var sliderEl = document.querySelector('.ad__slider');
    var isPortraitMode = isPortraitModeFn();

    document.querySelector('.ad__close').addEventListener('click', closeCb);
    sliderEl.addEventListener('touchstart', sliderTouchstart);
    sliderEl.addEventListener('mousedown', sliderTouchstart);
    sliderEl.addEventListener('touchend', sliderTouchend);
    sliderEl.addEventListener('mouseup', sliderTouchend);
    window.addEventListener('resize', resizeCb.bind(null, adContainer));

    // adjustContainer(adContainer, isPortraitMode);
    switchUI(isPortraitMode);
    slider.init(sliderEl);
  });
})();