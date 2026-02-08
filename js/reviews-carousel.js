/**
 * Reviews carousel: auto-advance and dot navigation. */
(function () {
	'use strict';

	var AUTO_INTERVAL_MS = 4000;
	var carousel = document.querySelector('.reviews-carousel');
	if (!carousel) return;

	var track = carousel.querySelector('.reviews-track');
	var cards = track ? Array.prototype.slice.call(track.querySelectorAll('.review-card')) : [];
	var dots = Array.prototype.slice.call(carousel.querySelectorAll('.reviews-dot'));

	if (cards.length === 0) return;

	var currentIndex = 0;
	var autoTimer = null;

	function setSlide(index) {
		var n = cards.length;
		currentIndex = ((index % n) + n) % n;

		cards.forEach(function (card, i) {
			card.classList.toggle('active', i === currentIndex);
		});
		dots.forEach(function (dot, i) {
			dot.classList.toggle('active', i === currentIndex);
			dot.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
		});
	}

	function nextSlide() {
		setSlide(currentIndex + 1);
	}

	function startAuto() {
		stopAuto();
		autoTimer = setInterval(nextSlide, AUTO_INTERVAL_MS);
	}

	function stopAuto() {
		if (autoTimer) {
			clearInterval(autoTimer);
			autoTimer = null;
		}
	}

	// Dot click: go to slide and restart auto
	dots.forEach(function (dot, i) {
		dot.addEventListener('click', function () {
			setSlide(i);
			startAuto();
		});
	});

	// Pause auto when hovering over carousel (better UX)
	carousel.addEventListener('mouseenter', stopAuto);
	carousel.addEventListener('mouseleave', startAuto);

	// Focus inside carousel: pause so keyboard users can read
	carousel.addEventListener('focusin', stopAuto);
	carousel.addEventListener('focusout', startAuto);

	// Initial state and start auto
	setSlide(0);
	startAuto();
})();
