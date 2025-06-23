class UserManager {
    constructor() {
        this.apiUrl = 'https://csrent.onrender.com/user';
        this.currentEditId = null;
        this.deleteUserId = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadUsers();
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
        this.userForm = document.getElementById('userForm');
        this.formTitle = document.getElementById('formTitle');
        this.searchIdInput = document.getElementById('searchId');

        // Table elements
        this.usersTableBody = document.getElementById('usersTableBody');
        this.loadingDiv = document.getElementById('loading');
        this.errorDiv = document.getElementById('error');

        // Modal
        this.deleteModal = document.getElementById('deleteModal');
    }

    attachEventListeners() {
        this.listAllBtn.addEventListener('click', () => this.loadUsers());
        this.refreshBtn.addEventListener('click', () => this.loadUsers());
        this.searchByIdBtn.addEventListener('click', () => this.searchUserById());
        this.userForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
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

    async loadUsers() {
        this.showLoading();
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
            const users = await response.json();
            this.displayUsers(users);
            this.hideLoading();
        } catch (error) {
            this.showError(`Error al cargar usuarios: ${error.message}`);
        }
    }

    async searchUserById() {
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
            const user = await response.json();
            this.displayUsers([user]);
            this.hideLoading();
            this.searchIdInput.value = '';
        } catch (error) {
            this.showError(`Error al buscar usuario: ${error.message}`);
        }
    }

    displayUsers(users) {
        this.usersTableBody.innerHTML = '';
        
        if (!users || users.length === 0) {
            this.usersTableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 30px; color: #6c757d;">
                        No se encontraron usuarios
                    </td>
                </tr>
            `;
            return;
        }

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id || 'N/A'}</td>
                <td>${user.name || 'N/A'}</td>
                <td class="email-cell" title="${user.email || 'N/A'}">${user.email || 'N/A'}</td>
                <td>
                    <span class="role-badge ${this.getRoleClass(user.role)}">
                        ${user.role || 'N/A'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-warning btn-small" onclick="userManager.editUser(${user.id})">
                            Editar
                        </button>
                        <button class="btn btn-danger btn-small" onclick="userManager.showDeleteModal(${user.id})">
                            Eliminar
                        </button>
                    </div>
                </td>
            `;
            this.usersTableBody.appendChild(row);
        });
    }

    getRoleClass(role) {
        const roleMap = {
            'Admin': 'role-admin',
            'Administrador': 'role-admin',
            'Consulta': 'role-consulta',
            'Usuario': 'role-usuario',
            'Moderador': 'role-moderador'
        };
        return roleMap[role] || 'role-usuario';
    }

    editUser(id) {
        // Find the user data from the table
        const rows = this.usersTableBody.querySelectorAll('tr');
        let userData = null;
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 0 && cells[0].textContent == id) {
                userData = {
                    id: cells[0].textContent,
                    name: cells[1].textContent,
                    email: cells[2].textContent,
                    role: cells[3].textContent.trim()
                };
            }
        });

        if (userData) {
            this.populateForm(userData);
            this.currentEditId = id;
            this.formTitle.textContent = 'Modificar Usuario';
            this.submitBtn.textContent = 'Actualizar Usuario';
            
            // Make password field optional for editing
            document.getElementById('password').required = false;
            document.getElementById('password').placeholder = 'Dejar vacío para mantener contraseña actual';
            
            // Scroll to form
            document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        }
    }

    populateForm(user) {
        document.getElementById('userId').value = user.id;
        document.getElementById('name').value = user.name;
        document.getElementById('email').value = user.email;
        document.getElementById('role').value = user.role;
        // Don't populate password for security reasons
        document.getElementById('password').value = '';
    }

    resetForm() {
        this.userForm.reset();
        this.currentEditId = null;
        this.formTitle.textContent = 'Crear Nuevo Usuario';
        this.submitBtn.textContent = 'Crear Usuario';
        document.getElementById('userId').value = '';
        document.getElementById('password').required = true;
        document.getElementById('password').placeholder = '';
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.userForm);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            role: formData.get('role')
        };

        // Only include password if it's provided
        const password = formData.get('password');
        if (password) {
            userData.password = password;
        }

        try {
            let response;
            let successMessage;

            if (this.currentEditId) {
                // Update existing user
                response = await fetch(`${this.apiUrl}/${this.currentEditId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData)
                });
                successMessage = 'Usuario actualizado exitosamente';
            } else {
                // Create new user - password is required
                if (!password) {
                    throw new Error('La contraseña es requerida para crear un nuevo usuario');
                }
                response = await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData)
                });
                successMessage = 'Usuario creado exitosamente';
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            this.showSuccess(successMessage);
            this.resetForm();
            this.loadUsers();

        } catch (error) {
            this.showError(`Error al ${this.currentEditId ? 'actualizar' : 'crear'} usuario: ${error.message}`);
        }
    }

    showDeleteModal(id) {
        this.deleteUserId = id;
        this.deleteModal.style.display = 'block';
    }

    closeDeleteModal() {
        this.deleteModal.style.display = 'none';
        this.deleteUserId = null;
    }

    async confirmDelete() {
        if (!this.deleteUserId) return;

        try {
            const response = await fetch(`${this.apiUrl}/${this.deleteUserId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            this.showSuccess('Usuario eliminado exitosamente');
            this.closeDeleteModal();
            this.loadUsers();

        } catch (error) {
            this.showError(`Error al eliminar usuario: ${error.message}`);
            this.closeDeleteModal();
        }
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.userManager = new UserManager();
});