/* ==========================================================================
   Dejinochi media kit: minimal vanilla JS
   --------------------------------------------------------------------------
   1. Optional local assets  (assets/*.png, assets/*.gif that may not exist yet)
   2. Screenshot placeholders (SCREENSHOT_1_URL ... not supplied yet)
   3. Media asset rows (only offer downloads for files that exist)
   4. Screenshot lightbox
   ========================================================================== */

(function () {
  'use strict';

  function each(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  /* ---------------------------------------------------------------------
     1. Optional local assets
     Anything marked data-optional is decorative. If the file is missing it
     is removed from the page so the layout never shows a broken image.
     If it also has data-fallback-text, that text is rendered instead.
     --------------------------------------------------------------------- */
  each(document.querySelectorAll('img[data-optional]'), function (img) {
    function onMissing() {
      var fallbackText = img.getAttribute('data-fallback-text');

      if (fallbackText) {
        var span = document.createElement('span');
        span.className = 'wordmark';
        span.textContent = fallbackText;
        if (img.parentNode) {
          img.parentNode.replaceChild(span, img);
        }
      } else if (img.parentNode) {
        img.parentNode.removeChild(img);
      }
    }

    if (img.complete) {
      if (img.naturalWidth === 0) onMissing();
    } else {
      img.addEventListener('error', onMissing);
    }
  });

  /* ---------------------------------------------------------------------
     2. Screenshot placeholders
     While SCREENSHOT_n_URL is still a placeholder the image cannot load, so
     the tile is replaced with a clearly labelled placeholder box.
     --------------------------------------------------------------------- */
  each(document.querySelectorAll('img[data-shot]'), function (img) {
    function onMissing() {
      var number = img.getAttribute('data-shot');
      var link = img.closest ? img.closest('a') : null;
      var target = link || img;

      var box = document.createElement('div');
      box.className = 'shot__missing';

      var label = document.createElement('span');
      label.textContent = 'Screenshot ' + number;

      var code = document.createElement('code');
      code.textContent = 'SCREENSHOT_' + number + '_URL';

      box.appendChild(label);
      box.appendChild(code);

      if (target.parentNode) {
        target.parentNode.replaceChild(box, target);
      }
    }

    if (img.complete) {
      if (img.naturalWidth === 0) onMissing();
    } else {
      img.addEventListener('error', onMissing);
    }
  });

  /* ---------------------------------------------------------------------
     3. Media asset cards
     Each card is removed unless its file is actually present in assets/.
     If a whole group turns out to be missing, its note is shown instead.
     --------------------------------------------------------------------- */
  each(document.querySelectorAll('[data-asset-group]'), function (group) {
    var cards = group.querySelectorAll('[data-asset]');
    var note = group.querySelector('[data-assets-empty]');
    var available = 0;
    var pending = cards.length;

    function settled() {
      pending -= 1;
      if (pending <= 0 && available === 0 && note) note.hidden = false;
    }

    each(cards, function (card) {
      var probe = new Image();

      probe.addEventListener('load', function () {
        available += 1;
        settled();
      });

      probe.addEventListener('error', function () {
        if (card.parentNode) card.parentNode.removeChild(card);
        settled();
      });

      probe.src = card.getAttribute('data-asset');
    });

    if (cards.length === 0 && note) note.hidden = false;
  });

  /* ---------------------------------------------------------------------
     3b. Hero vertical capsule
     Adds a class so the hero switches to two columns only when the key art
     is actually there.
     --------------------------------------------------------------------- */
  var heroCapsule = document.querySelector('[data-hero-capsule]');
  if (heroCapsule) {
    var heroImage = heroCapsule.querySelector('img');
    var hero = heroCapsule.closest('.hero');

    if (heroImage && hero) {
      var markHero = function () { hero.classList.add('hero--has-capsule'); };
      if (heroImage.complete && heroImage.naturalWidth > 0) markHero();
      else heroImage.addEventListener('load', markHero);
    }
  }

  /* ---------------------------------------------------------------------
     4. Screenshot lightbox
     Progressive enhancement: the links work on their own without JS, and
     are upgraded to an in-page lightbox when JS is available.
     --------------------------------------------------------------------- */
  var lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  var lightboxImg = lightbox.querySelector('.lightbox__img');
  var closeBtn = lightbox.querySelector('.lightbox__close');
  var lastFocused = null;

  function openLightbox(href, alt) {
    lastFocused = document.activeElement;
    lightboxImg.src = href;
    lightboxImg.alt = alt || '';
    lightbox.hidden = false;
    document.body.classList.add('is-locked');
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.removeAttribute('src');
    lightboxImg.alt = '';
    document.body.classList.remove('is-locked');
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  each(document.querySelectorAll('a[data-lightbox]'), function (link) {
    link.addEventListener('click', function (event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;

      var img = link.querySelector('img');
      openLightbox(link.getAttribute('href'), img ? img.alt : '');
      event.preventDefault();
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', function (event) {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });
})();

/* The trailer is a plain YouTube embed, so it needs no JavaScript at all. */
