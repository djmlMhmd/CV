function rgbToHex(r, g, b) {
	return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function extractPalette(img, count = 8) {
	const canvas = document.createElement('canvas');
	const size = 160;
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0, size, size);

	const data = ctx.getImageData(0, 0, size, size).data;
	const colorMap = {};

	for (let i = 0; i < data.length; i += 4) {
		if (data[i + 3] < 128) continue;
		const r = Math.round(data[i] / 20) * 20;
		const g = Math.round(data[i + 1] / 20) * 20;
		const b = Math.round(data[i + 2] / 20) * 20;
		const key = `${r},${g},${b}`;
		colorMap[key] = (colorMap[key] || 0) + 1;
	}

	const sorted = Object.entries(colorMap)
		.sort((a, b) => b[1] - a[1])
		.map(([k]) => k.split(',').map(Number));

	const palette = [];
	for (const color of sorted) {
		const tooClose = palette.some((c) => {
			const dr = c[0] - color[0], dg = c[1] - color[1], db = c[2] - color[2];
			return Math.sqrt(dr * dr + dg * dg + db * db) < 48;
		});
		if (!tooClose) palette.push(color);
		if (palette.length >= count) break;
	}

	return palette.map(([r, g, b]) => ({ css: `rgb(${r},${g},${b})`, hex: rgbToHex(r, g, b) }));
}

function buildPaletteUI(img) {
	const paletteEl = document.getElementById('drawingPalette');
	paletteEl.innerHTML = '';
	extractPalette(img).forEach(({ css, hex }) => {
		const swatch = document.createElement('div');
		swatch.className = 'palette-swatch';
		swatch.style.background = css;
		swatch.dataset.hex = hex;
		paletteEl.appendChild(swatch);
	});
}

let allImages = [];
let currentIndex = 0;

function selectDrawing(index, thumbEls) {
	const lbImg = document.getElementById('drawingLightboxImg');

	// Fade out
	lbImg.classList.add('switching');

	setTimeout(() => {
		currentIndex = index;
		const img = allImages[index];
		lbImg.src = img.src;
		lbImg.alt = img.alt;

		// Mise à jour thumbnail actif
		thumbEls.forEach((t, i) => t.classList.toggle('active', i === index));

		// Scroll la sidebar pour que le thumb actif soit visible
		thumbEls[index]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

		document.getElementById('drawingPalette').innerHTML = '';

		lbImg.classList.remove('switching');

		if (lbImg.complete && lbImg.naturalWidth > 0) {
			buildPaletteUI(lbImg);
		} else {
			lbImg.onload = () => buildPaletteUI(lbImg);
		}
	}, 160);
}

function openDrawingLightbox(clickedImg) {
	const lightbox = document.getElementById('drawingLightbox');
	const sidebar = document.getElementById('drawingSidebar');

	allImages = Array.from(document.querySelectorAll('.drawing-cell img'));
	currentIndex = allImages.indexOf(clickedImg);

	// Construire la sidebar
	sidebar.innerHTML = '';
	const thumbEls = allImages.map((img, i) => {
		const thumb = document.createElement('div');
		thumb.className = 'drawing-thumb' + (i === currentIndex ? ' active' : '');
		const t = document.createElement('img');
		t.src = img.src;
		t.alt = img.alt;
		thumb.appendChild(t);
		thumb.addEventListener('click', () => selectDrawing(i, thumbEls));
		sidebar.appendChild(thumb);
		return thumb;
	});

	// Charger l'image principale
	const lbImg = document.getElementById('drawingLightboxImg');
	lbImg.src = clickedImg.src;
	lbImg.alt = clickedImg.alt;
	document.getElementById('drawingPalette').innerHTML = '';

	if (lbImg.complete && lbImg.naturalWidth > 0) {
		buildPaletteUI(lbImg);
	} else {
		lbImg.onload = () => buildPaletteUI(lbImg);
	}

	document.body.style.overflow = 'hidden';
	lightbox.style.display = 'flex';
	requestAnimationFrame(() => requestAnimationFrame(() => lightbox.classList.add('open')));
}

function closeDrawingLightbox() {
	const lightbox = document.getElementById('drawingLightbox');
	lightbox.classList.remove('open');
	setTimeout(() => {
		lightbox.style.display = 'none';
		document.body.style.overflow = '';
	}, 300);
}

document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('.drawing-cell img').forEach((img) => {
		img.addEventListener('click', () => openDrawingLightbox(img));
	});

	document.getElementById('drawingClose').addEventListener('click', closeDrawingLightbox);

	document.getElementById('drawingLightbox').addEventListener('click', (e) => {
		if (e.target === e.currentTarget) closeDrawingLightbox();
	});

	document.addEventListener('keydown', (e) => {
		if (!document.getElementById('drawingLightbox').classList.contains('open')) return;
		const thumbEls = Array.from(document.querySelectorAll('.drawing-thumb'));
		if (e.key === 'Escape') closeDrawingLightbox();
		if (e.key === 'ArrowRight' || e.key === 'ArrowDown')
			selectDrawing((currentIndex + 1) % allImages.length, thumbEls);
		if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
			selectDrawing((currentIndex - 1 + allImages.length) % allImages.length, thumbEls);
	});
});
