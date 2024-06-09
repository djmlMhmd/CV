document.addEventListener('DOMContentLoaded', function () {
	var observer = new IntersectionObserver(
		function (entries) {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('visible');
				} else {
					entry.target.classList.remove('visible');
				}
			});
		},
		{
			threshold: 0.3,
			rootMargin: '0px',
		}
	);

	var fadeIns = document.querySelectorAll('.fade-in');
	fadeIns.forEach((element) => {
		observer.observe(element);
	});
});
