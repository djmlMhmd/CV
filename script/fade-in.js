document.addEventListener('DOMContentLoaded', function () {
	// Fade-in on scroll
	var fadeObserver = new IntersectionObserver(
		function (entries) {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('visible');
				} else {
					entry.target.classList.remove('visible');
				}
			});
		},
		{ threshold: 0.15, rootMargin: '0px' }
	);

	document.querySelectorAll('.fade-in').forEach((el) => fadeObserver.observe(el));

	// Nav active state
	const sections = document.querySelectorAll('[id]');
	const navItems = document.querySelectorAll('.nav-item');

	const navObserver = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					navItems.forEach((item) => {
						item.classList.toggle(
							'active',
							item.getAttribute('href') === '#' + entry.target.id
						);
					});
				}
			});
		},
		{ threshold: 0.4 }
	);

	sections.forEach((section) => navObserver.observe(section));
});
