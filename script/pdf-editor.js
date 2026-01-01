// Configuration PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

class PDFEditor {
    constructor() {
        this.pdfDoc = null;
        this.pdfBytes = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.scale = 1.5;
        this.textElements = [];
        this.modifications = {};
        this.canvas = document.getElementById('pdfCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.textLayer = document.getElementById('textLayer');

        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.elements = {
            pdfInput: document.getElementById('pdfInput'),
            savePdf: document.getElementById('savePdf'),
            resetPdf: document.getElementById('resetPdf'),
            prevPage: document.getElementById('prevPage'),
            nextPage: document.getElementById('nextPage'),
            pageNum: document.getElementById('pageNum'),
            pageCount: document.getElementById('pageCount'),
            zoomIn: document.getElementById('zoomIn'),
            zoomOut: document.getElementById('zoomOut'),
            zoomLevel: document.getElementById('zoomLevel'),
            statusMessage: document.getElementById('statusMessage'),
            welcomeScreen: document.getElementById('welcomeScreen'),
            canvasContainer: document.getElementById('canvasContainer'),
            pageControls: document.querySelector('.page-controls'),
            modal: document.getElementById('editModal'),
            editTextArea: document.getElementById('editTextArea'),
            fontSize: document.getElementById('fontSize'),
            textColor: document.getElementById('textColor'),
            applyEdit: document.getElementById('applyEdit'),
            cancelEdit: document.getElementById('cancelEdit'),
            closeModal: document.querySelector('.close')
        };
    }

    attachEventListeners() {
        // Chargement du fichier
        this.elements.pdfInput.addEventListener('change', (e) => this.loadPDF(e));

        // Navigation
        this.elements.prevPage.addEventListener('click', () => this.changePage(-1));
        this.elements.nextPage.addEventListener('click', () => this.changePage(1));

        // Zoom
        this.elements.zoomIn.addEventListener('click', () => this.zoom(0.1));
        this.elements.zoomOut.addEventListener('click', () => this.zoom(-0.1));

        // Sauvegarde et réinitialisation
        this.elements.savePdf.addEventListener('click', () => this.savePDF());
        this.elements.resetPdf.addEventListener('click', () => this.resetModifications());

        // Modal
        this.elements.closeModal.addEventListener('click', () => this.closeModal());
        this.elements.cancelEdit.addEventListener('click', () => this.closeModal());
        this.elements.applyEdit.addEventListener('click', () => this.applyTextEdit());

        // Fermer modal en cliquant en dehors
        window.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) {
                this.closeModal();
            }
        });
    }

    async loadPDF(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.updateStatus('Chargement du PDF...');

        try {
            // Lire le fichier
            const arrayBuffer = await file.arrayBuffer();
            this.pdfBytes = new Uint8Array(arrayBuffer);

            // Charger avec PDF.js pour l'affichage
            const loadingTask = pdfjsLib.getDocument({ data: this.pdfBytes });
            this.pdfDoc = await loadingTask.promise;
            this.totalPages = this.pdfDoc.numPages;

            // Mettre à jour l'interface
            this.elements.welcomeScreen.style.display = 'none';
            this.elements.canvasContainer.style.display = 'block';
            this.elements.pageControls.style.display = 'flex';
            this.elements.savePdf.disabled = false;
            this.elements.resetPdf.disabled = false;
            this.elements.pageCount.textContent = this.totalPages;

            // Afficher la première page
            this.currentPage = 1;
            await this.renderPage();

            this.updateStatus(`PDF chargé avec succès (${this.totalPages} page${this.totalPages > 1 ? 's' : ''})`);
        } catch (error) {
            console.error('Erreur lors du chargement du PDF:', error);
            this.updateStatus('Erreur lors du chargement du PDF');
            alert('Impossible de charger le PDF. Veuillez réessayer avec un autre fichier.');
        }
    }

    async renderPage() {
        if (!this.pdfDoc) return;

        try {
            // Obtenir la page
            const page = await this.pdfDoc.getPage(this.currentPage);
            const viewport = page.getViewport({ scale: this.scale });

            // Configurer le canvas
            this.canvas.width = viewport.width;
            this.canvas.height = viewport.height;
            this.textLayer.style.width = viewport.width + 'px';
            this.textLayer.style.height = viewport.height + 'px';

            // Effacer le contenu précédent
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.textLayer.innerHTML = '';

            // Rendre la page
            const renderContext = {
                canvasContext: this.ctx,
                viewport: viewport
            };
            await page.render(renderContext).promise;

            // Extraire et afficher le texte
            await this.extractText(page, viewport);

            // Mettre à jour l'interface
            this.elements.pageNum.textContent = this.currentPage;
            this.elements.prevPage.disabled = this.currentPage === 1;
            this.elements.nextPage.disabled = this.currentPage === this.totalPages;

            this.updateStatus(`Page ${this.currentPage}/${this.totalPages}`);
        } catch (error) {
            console.error('Erreur lors du rendu de la page:', error);
            this.updateStatus('Erreur lors du rendu de la page');
        }
    }

    async extractText(page, viewport) {
        try {
            const textContent = await page.getTextContent();
            this.textElements = [];

            textContent.items.forEach((item, index) => {
                const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);

                const textDiv = document.createElement('div');
                textDiv.className = 'text-element';
                textDiv.textContent = item.str;
                textDiv.dataset.index = index;
                textDiv.dataset.pageNum = this.currentPage;

                // Position et style
                const fontSize = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]);
                textDiv.style.left = tx[4] + 'px';
                textDiv.style.top = (viewport.height - tx[5] - fontSize) + 'px';
                textDiv.style.fontSize = fontSize + 'px';
                textDiv.style.fontFamily = item.fontName || 'sans-serif';

                // Gérer les modifications existantes
                const modKey = `${this.currentPage}-${index}`;
                if (this.modifications[modKey]) {
                    const mod = this.modifications[modKey];
                    textDiv.textContent = mod.text;
                    textDiv.style.fontSize = mod.fontSize + 'px';
                    textDiv.style.color = mod.color;
                }

                // Événement de clic pour éditer
                textDiv.addEventListener('click', (e) => this.openEditModal(e, item, index));

                this.textLayer.appendChild(textDiv);
                this.textElements.push({
                    element: textDiv,
                    original: item.str,
                    index: index,
                    fontSize: fontSize,
                    x: tx[4],
                    y: tx[5]
                });
            });
        } catch (error) {
            console.error('Erreur lors de l\'extraction du texte:', error);
        }
    }

    openEditModal(event, item, index) {
        const textDiv = event.target;
        const modKey = `${this.currentPage}-${index}`;

        // Remplir le modal avec les données actuelles
        this.elements.editTextArea.value = textDiv.textContent;
        this.elements.fontSize.value = parseInt(textDiv.style.fontSize);

        // Convertir la couleur RGB en hexadécimal si nécessaire
        const color = textDiv.style.color || '#000000';
        this.elements.textColor.value = this.rgbToHex(color);

        // Stocker les informations pour l'application
        this.currentEditElement = {
            textDiv: textDiv,
            index: index,
            modKey: modKey
        };

        // Marquer comme sélectionné
        document.querySelectorAll('.text-element').forEach(el => el.classList.remove('selected'));
        textDiv.classList.add('selected');

        // Afficher le modal
        this.elements.modal.classList.add('show');
        this.elements.editTextArea.focus();
    }

    applyTextEdit() {
        if (!this.currentEditElement) return;

        const newText = this.elements.editTextArea.value;
        const newFontSize = parseInt(this.elements.fontSize.value);
        const newColor = this.elements.textColor.value;

        const { textDiv, modKey } = this.currentEditElement;

        // Appliquer les modifications
        textDiv.textContent = newText;
        textDiv.style.fontSize = newFontSize + 'px';
        textDiv.style.color = newColor;

        // Stocker les modifications
        this.modifications[modKey] = {
            text: newText,
            fontSize: newFontSize,
            color: newColor,
            pageNum: this.currentPage,
            index: this.currentEditElement.index
        };

        this.closeModal();
        this.updateStatus('Modification appliquée. N\'oubliez pas de sauvegarder !');
    }

    closeModal() {
        this.elements.modal.classList.remove('show');
        document.querySelectorAll('.text-element').forEach(el => el.classList.remove('selected'));
        this.currentEditElement = null;
    }

    async savePDF() {
        if (Object.keys(this.modifications).length === 0) {
            alert('Aucune modification à sauvegarder');
            return;
        }

        this.updateStatus('Sauvegarde en cours...');

        try {
            // Charger le PDF avec pdf-lib
            const pdfDoc = await PDFLib.PDFDocument.load(this.pdfBytes);
            const pages = pdfDoc.getPages();

            // Appliquer les modifications
            for (const [key, mod] of Object.entries(this.modifications)) {
                const [pageNum, index] = key.split('-').map(Number);
                const page = pages[pageNum - 1];

                if (page) {
                    const { height } = page.getSize();

                    // Trouver l'élément de texte original pour obtenir la position
                    const textElement = this.textElements.find(el => el.index === index);
                    if (textElement) {
                        // Dessiner le nouveau texte
                        page.drawText(mod.text, {
                            x: textElement.x,
                            y: height - textElement.y - mod.fontSize,
                            size: mod.fontSize,
                            color: PDFLib.rgb(
                                parseInt(mod.color.slice(1, 3), 16) / 255,
                                parseInt(mod.color.slice(3, 5), 16) / 255,
                                parseInt(mod.color.slice(5, 7), 16) / 255
                            )
                        });
                    }
                }
            }

            // Sauvegarder le PDF
            const pdfBytes = await pdfDoc.save();

            // Télécharger
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'document_modifie.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.updateStatus('PDF sauvegardé avec succès !');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            this.updateStatus('Erreur lors de la sauvegarde');
            alert('Une erreur est survenue lors de la sauvegarde. Vos modifications sont conservées dans l\'éditeur.');
        }
    }

    resetModifications() {
        if (Object.keys(this.modifications).length === 0) {
            alert('Aucune modification à réinitialiser');
            return;
        }

        if (confirm('Voulez-vous vraiment annuler toutes les modifications ?')) {
            this.modifications = {};
            this.renderPage();
            this.updateStatus('Modifications réinitialisées');
        }
    }

    async changePage(delta) {
        const newPage = this.currentPage + delta;
        if (newPage >= 1 && newPage <= this.totalPages) {
            this.currentPage = newPage;
            await this.renderPage();
        }
    }

    async zoom(delta) {
        this.scale = Math.max(0.5, Math.min(3, this.scale + delta));
        this.elements.zoomLevel.textContent = Math.round(this.scale * 100) + '%';
        await this.renderPage();
    }

    rgbToHex(rgb) {
        if (rgb.startsWith('#')) return rgb;

        const result = rgb.match(/\d+/g);
        if (!result || result.length < 3) return '#000000';

        const r = parseInt(result[0]).toString(16).padStart(2, '0');
        const g = parseInt(result[1]).toString(16).padStart(2, '0');
        const b = parseInt(result[2]).toString(16).padStart(2, '0');

        return `#${r}${g}${b}`;
    }

    updateStatus(message) {
        this.elements.statusMessage.textContent = message;
    }
}

// Initialiser l'éditeur au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    new PDFEditor();
});
