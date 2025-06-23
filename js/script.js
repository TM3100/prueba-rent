class SpaceManager {
    constructor() {
        this.apiUrl = 'https://csrent.onrender.com/space';
        this.currentEditId = null;
        this.deleteSpaceId = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadSpaces();
    }

    initializeElements() {
        // Buttons
        this.listAllBtn = document.getElementById('listAllBtn');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.searchByIdBtn = document.getElementById('searchByIdBtn');
        this.submitBtn = document.getElementById('submitBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        this.cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

        // Form elements
        this.spaceForm = document.getElementById('spaceForm');
        this.formTitle = document.getElementById('formTitle');
        this.searchIdInput = document.getElementById('searchId');

        // Table elements
        this.spacesTableBody = document.getElementById('spacesTableBody');
        this.loadingDiv = document.getElementById('loading');
        this.errorDiv = document.getElementById('error');

        // Modal
        this.deleteModal = document.getElementById('deleteModal');
    }

    attachEventListeners() {
        this.listAllBtn.addEventListener('click', () => this.loadSpaces());
        this.refreshBtn.addEventListener('click', () => this.loadSpaces());
        this.searchByIdBtn.addEventListener('click', () => this.searchSpaceById());
        this.spaceForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.cancelBtn.addEventListener('click', () => this.resetForm());
        this.confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());
        this.cancelDeleteBtn.addEventListener('click', () => this.closeDeleteModal());

        // Close modal when clicking outside
        this.deleteModal.addEventListener('click', (e) => {
            if (e.target === this.deleteModal) {
                this.closeDeleteModal();
            }
        });
    }

    showLoading() {
        this.loadingDiv.style.display = 'block';
        this.errorDiv.style.display = 'none';
    }

    hideLoading() {
        this.loadingDiv.style.display = 'none';
    }

    showError(message) {
        this.errorDiv.textContent = message;
        this.errorDiv.style.display = 'block';
        this.hideLoading();
    }

    showSuccess(message) {
        // Remove any existing success message
        const existingSuccess = document.querySelector('.success');
        if (existingSuccess) {
            existingSuccess.remove();
        }

        const successDiv = document.createElement('div');
        successDiv.className = 'success';
        successDiv.textContent = message;
        
        const tableSection = document.querySelector('.table-section');
        tableSection.insertBefore(successDiv, tableSection.firstChild);

        // Remove after 3 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    async loadSpaces() {
        this.showLoading();
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
            const spaces = await response.json();
            this.displaySpaces(spaces);
            this.hideLoading();
        } catch (error) {
            this.showError(`Error al cargar espacios: ${error.message}`);
        }
    }

    async searchSpaceById() {
        const id = this.searchIdInput.value.trim();
        if (!id) {
            alert('Por favor ingresa un ID válido');
            return;
        }

        this.showLoading();
        try {
            const response = await fetch(`${this.apiUrl}/${id}`);
            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
            const space = await response.json();
            this.displaySpaces([space]);
            this.hideLoading();
            this.searchIdInput.value = '';
        } catch (error) {
            this.showError(`Error al buscar espacio: ${error.message}`);
        }
    }

    displaySpaces(spaces) {
        this.spacesTableBody.innerHTML = '';
        
        if (!spaces || spaces.length === 0) {
            this.spacesTableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 30px; color: #6c757d;">
                        No se encontraron espacios
                    </td>
                </tr>
            `;
            return;
        }

        spaces.forEach(space => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${space.id || 'N/A'}</td>
                <td>${space.name || 'N/A'}</td>
                <td>${space.description || 'N/A'}</td>
                <td>${space.location || 'N/A'}</td>
                <td>${space.capacity || 'N/A'}</td>
                <td>$${space.price || '0'}</td>
                <td>
                    <span class="status-badge ${space.available ? 'status-available' : 'status-unavailable'}">
                        ${space.available ? 'Disponible' : 'No disponible'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-warning btn-small" onclick="spaceManager.editSpace(${space.id})">
                            Editar
                        </button>
                        <button class="btn btn-danger btn-small" onclick="spaceManager.showDeleteModal(${space.id})">
                            Eliminar
                        </button>
                    </div>
                </td>
            `;
            this.spacesTableBody.appendChild(row);
        });
    }

    editSpace(id) {
        // Find the space data from the table
        const rows = this.spacesTableBody.querySelectorAll('tr');
        let spaceData = null;
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 0 && cells[0].textContent == id) {
                spaceData = {
                    id: cells[0].textContent,
                    name: cells[1].textContent,
                    description: cells[2].textContent,
                    location: cells[3].textContent,
                    capacity: cells[4].textContent,
                    price: cells[5].textContent.replace('$', ''),
                    available: cells[6].textContent.includes('Disponible')
                };
            }
        });

        if (spaceData) {
            this.populateForm(spaceData);
            this.currentEditId = id;
            this.formTitle.textContent = 'Modificar Espacio';
            this.submitBtn.textContent = 'Actualizar Espacio';
            
            // Scroll to form
            document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        }
    }

    populateForm(space) {
        document.getElementById('spaceId').value = space.id;
        document.getElementById('name').value = space.name;
        document.getElementById('description').value = space.description;
        document.getElementById('location').value = space.location;
        document.getElementById('capacity').value = space.capacity;
        document.getElementById('price').value = space.price;
        document.getElementById('available').value = space.available.toString();
    }

    resetForm() {
        this.spaceForm.reset();
        this.currentEditId = null;
        this.formTitle.textContent = 'Crear Nuevo Espacio';
        this.submitBtn.textContent = 'Crear Espacio';
        document.getElementById('spaceId').value = '';
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.spaceForm);
        const spaceData = {
            name: formData.get('name'),
            description: formData.get('description'),
            location: formData.get('location'),
            capacity: parseInt(formData.get('capacity')),
            price: parseFloat(formData.get('price')),
            available: formData.get('available') === 'true'
        };

        try {
            let response;
            let successMessage;

            if (this.currentEditId) {
                // Update existing space
                response = await fetch(`${this.apiUrl}/${this.currentEditId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(spaceData)
                });
                successMessage = 'Espacio actualizado exitosamente';
            } else {
                // Create new space
                response = await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(spaceData)
                });
                successMessage = 'Espacio creado exitosamente';
            }

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            this.showSuccess(successMessage);
            this.resetForm();
            this.loadSpaces();

        } catch (error) {
            this.showError(`Error al ${this.currentEditId ? 'actualizar' : 'crear'} espacio: ${error.message}`);
        }
    }

    showDeleteModal(id) {
        this.deleteSpaceId = id;
        this.deleteModal.style.display = 'block';
    }

    closeDeleteModal() {
        this.deleteModal.style.display = 'none';
        this.deleteSpaceId = null;
    }

    async confirmDelete() {
        if (!this.deleteSpaceId) return;

        try {
            const response = await fetch(`${this.apiUrl}/${this.deleteSpaceId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            this.showSuccess('Espacio eliminado exitosamente');
            this.closeDeleteModal();
            this.loadSpaces();

        } catch (error) {
            this.showError(`Error al eliminar espacio: ${error.message}`);
            this.closeDeleteModal();
        }
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.spaceManager = new SpaceManager();
});

 