const projectDetails = {
	Planifi: {
		title: 'Planifi',
		images: [
			'img/portfolio/Planifi/PLANIFI.png',
			'img/portfolio/Planifi/4c982e2f-13ba-4f6e-978a-e6096ad63380.JPG',
			'img/portfolio/Planifi/75acdb06-c342-423c-9d44-9a1bef5b9806.JPG',
			'img/portfolio/Planifi/b3017465-939c-416a-ab2f-4bfaab1c7017.JPG',
			'img/portfolio/Planifi/ea9b3cc7-aab2-4551-8e73-8d1acafb5e69.JPG',
		],
		link: 'https://github.com/djmlMhmd/Planifi-ReadMe',
	},
	Printf: {
		title: 'Printf()',
		images: [
			'img/portfolio/Printf/PRINTF.png',
			'img/portfolio/Printf/printf_2.png',
			'img/portfolio/Printf/printf_3.png',
		],
		link: 'https://github.com/djmlMhmd/holbertonschool-printf/blob/master/README.md',
	},
	Airbnb: {
		title: 'AirBnB Clone',
		images: [
			'img/portfolio/Airbnb/Airbnb.png',
			'img/portfolio/Airbnb/A1.png',
			'img/portfolio/Airbnb/A2.png',
			'img/portfolio/Airbnb/A4.png',
			'img/portfolio/Airbnb/A3.jpeg',
		],
		link: 'https://github.com/djmlMhmd/holbertonschool-AirBnB_clone/blob/main/README.md',
	},
	Python: {
		title: 'Python',
		images: ['img/portfolio/Python/Python.png'],
		link: 'https://github.com/djmlMhmd/holbertonschool-higher_level_programming/blob/main/README.md',
	},
};

function openModal(projectName) {
	const modal = document.getElementById('portfolioModal');
	const project = projectDetails[projectName];
	if (!project) return;

	document.getElementById('modalTitle').textContent = project.title;
	document.getElementById('modalLink').href = project.link;

	const container = modal.querySelector('.modal-images');
	container.innerHTML = '';
	project.images.forEach((src) => {
		const img = document.createElement('img');
		img.src = src;
		img.alt = project.title;
		container.appendChild(img);
	});

	document.body.style.overflow = 'hidden';
	modal.style.display = 'flex';
	requestAnimationFrame(() => modal.classList.add('open'));
}

function closeModal() {
	const modal = document.getElementById('portfolioModal');
	modal.classList.remove('open');
	setTimeout(() => {
		modal.style.display = 'none';
		document.body.style.overflow = '';
	}, 200);
}

document.addEventListener('DOMContentLoaded', () => {
	const modal = document.getElementById('portfolioModal');

	modal.addEventListener('click', (e) => {
		if (e.target === modal) closeModal();
	});

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') closeModal();
	});
});
