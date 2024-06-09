// Fonctions pour gérer le défilement
function scrollLeft(containerClass) {
	const container = document.querySelector(containerClass);
	container.scrollBy({
		left: -600,
		behavior: 'smooth',
	});
}

function scrollRight(containerClass) {
	const container = document.querySelector(containerClass);
	container.scrollBy({
		left: 600,
		behavior: 'smooth',
	});
}

// Fonction pour activer le glissement de la souris sur les carrousels
function enableDragScroll(containerSelector) {
	const slider = document.querySelector(containerSelector);
	let isDown = false;
	let startX;
	let scrollLeft;

	slider.addEventListener('mousedown', (e) => {
		isDown = true;
		slider.classList.add('active');
		startX = e.pageX - slider.offsetLeft;
		scrollLeft = slider.scrollLeft;
	});

	slider.addEventListener('mouseleave', () => {
		isDown = false;
		slider.classList.remove('active');
	});

	slider.addEventListener('mouseup', () => {
		isDown = false;
		slider.classList.remove('active');
	});

	slider.addEventListener('mousemove', (e) => {
		if (!isDown) return;
		e.preventDefault();
		const x = e.pageX - slider.offsetLeft;
		const walk = (x - startX) * 3; // Multiplier to increase scroll speed
		slider.scrollLeft = scrollLeft - walk;
	});
}

document.addEventListener('DOMContentLoaded', function () {
	// Handlers for Drawing
	const drawingLeftBtn = document.querySelector('.drawing .scroll-btn.left');
	const drawingRightBtn = document.querySelector(
		'.drawing .scroll-btn.right'
	);
	const drawingContainer = document.querySelector('.drawing-slide');

	drawingLeftBtn?.addEventListener('click', () =>
		scrollLeft('.drawing-slide')
	);
	drawingRightBtn?.addEventListener('click', () =>
		scrollRight('.drawing-slide')
	);

	// Handlers for Portfolio
	const portfolioLeftBtn = document.querySelector('.portfolio-left');
	const portfolioRightBtn = document.querySelector('.portfolio-right');
	const portfolioContainer = document.querySelector('.portfolio-slide');

	portfolioLeftBtn?.addEventListener('click', () =>
		scrollLeft('.portfolio-slide')
	);
	portfolioRightBtn?.addEventListener('click', () =>
		scrollRight('.portfolio-slide')
	);

	// Enable mouse drag for Drawing and Portfolio
	enableDragScroll('.drawing-slide');
	enableDragScroll('.portfolio-slide');

	// Update arrows function to control visibility
	function updateArrows(container, btnLeft, btnRight) {
		const maxScrollLeft = container.scrollWidth - container.clientWidth;
		btnLeft.style.display = container.scrollLeft > 0 ? 'flex' : 'none';
		btnRight.style.display =
			container.scrollLeft < maxScrollLeft ? 'flex' : 'none';
	}

	drawingContainer.addEventListener('scroll', () =>
		updateArrows(drawingContainer, drawingLeftBtn, drawingRightBtn)
	);
	portfolioContainer.addEventListener('scroll', () =>
		updateArrows(portfolioContainer, portfolioLeftBtn, portfolioRightBtn)
	);
});
