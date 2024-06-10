// Dictionnaire des images par projet
const projectDetails = {
	Planifi: {
		title: 'Planifi Project',
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
		title: 'Printf() Project',
		images: [
			'img/portfolio/Printf/PRINTF.png',
			'img/portfolio/Printf/printf_2.png',
			'img/portfolio/Printf/printf_3.png',
		],
		link: 'https://github.com/djmlMhmd/holbertonschool-printf/blob/master/README.md',
	},
	Airbnb: {
		title: 'Airbnb Project',
		images: [
			'img/portfolio/Airbnb/A1.png',
			'img/portfolio/Airbnb/A2.png',
			'img/portfolio/Airbnb/A4.png',
			'img/portfolio/Airbnb/A3.jpeg',
		],
		link: 'https://github.com/djmlMhmd/holbertonschool-AirBnB_clone/blob/main/README.md',
	},
	Python: {
		title: 'Python Project',
		images: ['img/portfolio/Python/Python.png'],
		link: 'https://github.com/djmlMhmd/holbertonschool-higher_level_programming/blob/main/README.md',
	},
};

document.addEventListener('DOMContentLoaded', function () {
	// Attach click event listeners to portfolio items
	document.querySelectorAll('.portfolio-item').forEach((item) => {
		item.addEventListener('click', function () {
			openModal(this.dataset.projectName);
		});
	});

	// Close modal when clicking outside of the modal content
	window.addEventListener('click', function (event) {
		const modal = document.getElementById('portfolioModal');
		if (event.target === modal) {
			closeModal();
		}
	});
	window.addEventListener('touchstart', function (event) {
		const modal = document.getElementById('portfolioModal');
		if (event.target === modal) {
			closeModal();
		}
	});
});

function openModal(projectName) {
	const modal = document.getElementById('portfolioModal');
	const modalTitle = document.getElementById('modalTitle');
	const modalLink = document.getElementById('modalLink');
	const modalImages = document.querySelector('.modal-images');

	// Clear previous images
	modalImages.innerHTML = '';

	// Retrieve project details based on the project name
	const project = projectDetails[projectName];

	if (project) {
		modalTitle.textContent = project.title; // Set the title
		modalLink.href = project.link; // Set the link URL
		modalLink.textContent = 'Learn more about ' + projectName; // Set the link text

		// Append images
		project.images.forEach((img) => {
			const imageElement = document.createElement('img');
			imageElement.src = img;
			modalImages.appendChild(imageElement);
		});

		modal.style.display = 'flex'; // Show modal
		document.body.style.overflow = 'hidden'; // Disable body scroll
	}
}

function closeModal() {
	const modal = document.getElementById('portfolioModal');
	modal.style.display = 'none'; // Hide modal
	document.body.style.overflow = 'auto'; // Re-enable body scroll
}

// Close modal when clicking outside of the modal content
window.onclick = function (event) {
	const modal = document.getElementById('portfolioModal');
	if (event.target === modal) {
		closeModal();
	}
};
