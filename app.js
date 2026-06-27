/**
 * ============================================
 * PROMPT MANAGER — SPA Application
 * ============================================
 * Lógica principal de la Single Page Application
 * para administración de prompts.
 * ============================================
 */

// ============================================
// CONFIGURACIÓN
// ============================================

/**
 * URL de la Web App de Google Apps Script.
 * INSTRUCCIONES:
 * 1. Desplegá tu Google Apps Script como Web App
 * 2. Copiá la URL generada
 * 3. Pegala aquí reemplazando el valor de API_URL
 */
const API_URL = 'https://script.google.com/macros/s/AKfycbwKq_hBkYHSEVTzlSc9LMaTnCXBXSOYnfvMqjoMx48_n6p9G1Lp2ONGC-SdmGPv4Rshpg/exec';



// ============================================
// THEME MANAGER
// ============================================

const ThemeManager = {
    STORAGE_KEY: 'prompt-manager-theme',

    init() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            this.setTheme(saved);
        } else {
            // Detectar preferencia del sistema
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setTheme(prefersDark ? 'dark' : 'light');
        }

        // Listener para cambios en preferencia del sistema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(this.STORAGE_KEY)) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });

        // Toggle button
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggle());
    },

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(this.STORAGE_KEY, theme);
    },

    toggle() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        this.setTheme(next);
    },

    get current() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }
};

// ============================================
// TOAST MANAGER
// ============================================

const ToastManager = {
    container: null,

    init() {
        this.container = document.getElementById('toast-container');
    },

    show(message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;

        const icons = {
            success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };

        toast.innerHTML = `
            <span class="toast__icon toast__icon--${type}">${icons[type]}</span>
            <span class="toast__message">${message}</span>
        `;

        this.container.appendChild(toast);

        // Auto-remove
        setTimeout(() => {
            toast.classList.add('toast--removing');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    success(message) { this.show(message, 'success'); },
    error(message) { this.show(message, 'error', 6000); },
    info(message) { this.show(message, 'info'); }
};

// ============================================
// API SERVICE
// ============================================

const ApiService = {
    /**
     * Verifica si la API está configurada.
     */
    isConfigured() {
        return API_URL && API_URL !== 'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI';
    },

    /**
     * Realiza una petición GET a la API.
     */
    async get(action, params = {}) {
        if (!this.isConfigured()) {
            return this._mockGet(action, params);
        }

        const url = new URL(API_URL);
        url.searchParams.set('action', action);
        Object.entries(params).forEach(([key, val]) => url.searchParams.set(key, val));

        try {
            const response = await fetch(url.toString());
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API GET Error:', error);
            throw new Error('Error de conexión con el servidor. Verificá la URL de la API.');
        }
    },

    /**
     * Realiza una petición POST a la API.
     */
    async post(action, body = {}) {
        if (!this.isConfigured()) {
            return this._mockPost(action, body);
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action, ...body })
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API POST Error:', error);
            throw new Error('Error de conexión con el servidor. Verificá la URL de la API.');
        }
    },

    // ============================================
    // MOCK DATA — Para uso sin backend
    // ============================================

    _mockStore: {
        prompts: [
            {
                id: 'demo-001',
                categoria: 'Marketing',
                nombre: 'Email de ventas',
                prompt: 'Escribe un email persuasivo para vender {producto} a {audiencia}. El tono debe ser profesional pero cercano.\n\nIncluye:\n- Un asunto llamativo\n- Saludo personalizado\n- Cuerpo del email con beneficios clave\n- Un CTA (Call to Action) claro\n- Despedida profesional',
                ejemplos: 'Producto: Curso de marketing digital\nAudiencia: Emprendedores\n\nAsunto: 🚀 Transforma tu negocio en 30 días\n\nHola [nombre],\n\nSabemos que como emprendedor, tu tiempo es valioso...',
                fecha: '2026-06-20 10:15:30'
            },
            {
                id: 'demo-002',
                categoria: 'Marketing',
                nombre: 'Post para redes sociales',
                prompt: 'Crea un post para {red_social} sobre {tema}. Debe incluir emojis relevantes, hashtags populares y un llamado a la acción. El tono debe ser {tono}.',
                ejemplos: 'Red social: Instagram\nTema: Lanzamiento de producto\nTono: Entusiasta\n\n🎉 ¡Es oficial! Nuestro nuevo producto ya está disponible...\n\n#lanzamiento #nuevoProducto #innovación',
                fecha: '2026-06-21 14:30:00'
            },
            {
                id: 'demo-003',
                categoria: 'Desarrollo',
                nombre: 'Code review',
                prompt: 'Actúa como un senior developer experto en {lenguaje}. Revisa el siguiente código y proporciona feedback detallado sobre:\n\n1. Rendimiento\n2. Seguridad\n3. Legibilidad\n4. Mejores prácticas\n5. Posibles bugs\n\nCódigo:\n{codigo}',
                ejemplos: 'Lenguaje: Python\nCódigo: def get_users(db):\n    return db.execute("SELECT * FROM users WHERE active = " + str(1))',
                fecha: '2026-06-22 09:12:00'
            },
            {
                id: 'demo-004',
                categoria: 'Desarrollo',
                nombre: 'Documentación API',
                prompt: 'Genera documentación profesional para una API REST. Para cada endpoint incluye:\n\n- Método HTTP y ruta\n- Descripción\n- Parámetros (query, path, body)\n- Headers requeridos\n- Response de ejemplo (éxito y error)\n- Códigos de estado HTTP\n\nEndpoints:\n{endpoints}',
                ejemplos: 'Endpoints: GET /api/users, POST /api/users, GET /api/users/:id',
                fecha: '2026-06-23 11:45:10'
            },
            {
                id: 'demo-005',
                categoria: 'Educación',
                nombre: 'Plan de clase',
                prompt: 'Diseña un plan de clase de {duracion} sobre {tema} para estudiantes de {nivel}.\n\nIncluye:\n- Objetivos de aprendizaje (3-5)\n- Materiales necesarios\n- Actividades con tiempos\n- Dinámica de grupo\n- Evaluación formativa\n- Tarea para casa',
                ejemplos: 'Duración: 2 horas\nTema: Inteligencia Artificial básica\nNivel: Universitario',
                fecha: '2026-06-24 08:20:00'
            },
            {
                id: 'demo-006',
                categoria: 'Escritura',
                nombre: 'Resumen ejecutivo',
                prompt: 'Resume el siguiente texto en un máximo de {palabras} palabras. Mantén los puntos clave, datos relevantes y conclusiones principales. Usa un tono {tono}.\n\nTexto:\n{texto}',
                ejemplos: '',
                fecha: '2026-06-24 16:05:40'
            }
        ]
    },

    _generateMockId() {
        return 'mock-' + Math.random().toString(36).substring(2, 10);
    },

    _mockGet(action, params) {
        return new Promise((resolve) => {
            setTimeout(() => {
                switch (action) {
                    case 'getAll':
                        resolve({ success: true, data: [...this._mockStore.prompts], message: 'OK' });
                        break;
                    case 'getById':
                        const found = this._mockStore.prompts.find(p => p.id === params.id);
                        resolve(found
                            ? { success: true, data: found, message: 'OK' }
                            : { success: false, data: null, message: 'No encontrado' }
                        );
                        break;
                    case 'getCategories':
                        const cats = {};
                        this._mockStore.prompts.forEach(p => {
                            cats[p.categoria] = (cats[p.categoria] || 0) + 1;
                        });
                        const result = Object.entries(cats).map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name));
                        resolve({ success: true, data: result, message: 'OK' });
                        break;
                    default:
                        resolve({ success: false, data: null, message: 'Acción no válida' });
                }
            }, 600);
        });
    },

    _mockPost(action, body) {
        return new Promise((resolve) => {
            setTimeout(() => {
                switch (action) {
                    case 'create': {
                        const newPrompt = {
                            id: this._generateMockId(),
                            categoria: body.categoria,
                            nombre: body.nombre,
                            prompt: body.prompt,
                            ejemplos: body.ejemplos || '',
                            fecha: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        };
                        this._mockStore.prompts.push(newPrompt);
                        resolve({ success: true, data: newPrompt, message: 'Prompt creado exitosamente' });
                        break;
                    }
                    case 'update': {
                        const idx = this._mockStore.prompts.findIndex(p => p.id === body.id);
                        if (idx === -1) {
                            resolve({ success: false, data: null, message: 'No encontrado' });
                        } else {
                            this._mockStore.prompts[idx] = { ...this._mockStore.prompts[idx], ...body };
                            resolve({ success: true, data: this._mockStore.prompts[idx], message: 'Prompt actualizado exitosamente' });
                        }
                        break;
                    }
                    case 'delete': {
                        const di = this._mockStore.prompts.findIndex(p => p.id === body.id);
                        if (di === -1) {
                            resolve({ success: false, data: null, message: 'No encontrado' });
                        } else {
                            const deleted = this._mockStore.prompts.splice(di, 1)[0];
                            resolve({ success: true, data: deleted, message: 'Prompt eliminado exitosamente' });
                        }
                        break;
                    }
                    default:
                        resolve({ success: false, data: null, message: 'Acción no válida' });
                }
            }, 500);
        });
    }
};

// ============================================
// MODAL MANAGER
// ============================================

const ModalManager = {
    overlay: null,
    modal: null,
    form: null,
    isEditing: false,
    editId: null,

    init() {
        this.overlay = document.getElementById('modal-overlay');
        this.modal = document.getElementById('prompt-modal');
        this.form = document.getElementById('prompt-form');

        // Event listeners
        document.getElementById('btn-new-prompt').addEventListener('click', () => this.openCreate());
        document.getElementById('btn-empty-new').addEventListener('click', () => this.openCreate());
        document.getElementById('modal-close').addEventListener('click', () => this.close());
        document.getElementById('modal-cancel').addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Auto-expand textareas
        document.querySelectorAll('.form-textarea').forEach(textarea => {
            textarea.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });
        });

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
                DeleteModal.close();
                DetailModal.close();
            }
        });
    },

    openCreate() {
        this.isEditing = false;
        this.editId = null;
        document.getElementById('modal-title').textContent = 'Nuevo Prompt';
        document.getElementById('submit-text').textContent = 'Guardar Prompt';
        this.form.reset();
        document.getElementById('form-id').value = '';
        this._updateCategorySuggestions();
        this.overlay.classList.remove('hidden');
        document.getElementById('form-categoria').focus();
        document.body.style.overflow = 'hidden';
    },

    openEdit(prompt) {
        this.isEditing = true;
        this.editId = prompt.id;
        document.getElementById('modal-title').textContent = 'Editar Prompt';
        document.getElementById('submit-text').textContent = 'Actualizar Prompt';

        document.getElementById('form-id').value = prompt.id;
        document.getElementById('form-categoria').value = prompt.categoria;
        document.getElementById('form-nombre').value = prompt.nombre;
        document.getElementById('form-prompt').value = prompt.prompt;
        document.getElementById('form-ejemplos').value = prompt.ejemplos;

        this._updateCategorySuggestions();
        this.overlay.classList.remove('hidden');
        document.getElementById('form-nombre').focus();
        document.body.style.overflow = 'hidden';
    },

    close() {
        this.overlay.classList.add('hidden');
        this.form.reset();
        document.body.style.overflow = '';
        this._resetSubmitButton();
    },

    async handleSubmit(e) {
        e.preventDefault();

        const data = {
            categoria: document.getElementById('form-categoria').value.trim(),
            nombre: document.getElementById('form-nombre').value.trim(),
            prompt: document.getElementById('form-prompt').value.trim(),
            ejemplos: document.getElementById('form-ejemplos').value.trim()
        };

        // Validación
        if (!data.categoria || !data.nombre || !data.prompt) {
            ToastManager.error('Por favor completá todos los campos obligatorios.');
            return;
        }

        this._setLoading(true);

        try {
            let result;
            if (this.isEditing) {
                result = await ApiService.post('update', { id: this.editId, ...data });
            } else {
                result = await ApiService.post('create', data);
            }

            if (result.success) {
                ToastManager.success(this.isEditing ? 'Prompt actualizado exitosamente' : 'Prompt creado exitosamente');
                this.close();
                await PromptManager.loadAll();
            } else {
                ToastManager.error(result.message || 'Error al guardar el prompt');
            }
        } catch (error) {
            ToastManager.error(error.message);
        } finally {
            this._setLoading(false);
        }
    },

    _setLoading(loading) {
        const textEl = document.getElementById('submit-text');
        const loaderEl = document.getElementById('submit-loader');
        const submitBtn = document.getElementById('modal-submit');

        if (loading) {
            textEl.classList.add('hidden');
            loaderEl.classList.remove('hidden');
            submitBtn.disabled = true;
        } else {
            textEl.classList.remove('hidden');
            loaderEl.classList.add('hidden');
            submitBtn.disabled = false;
        }
    },

    _resetSubmitButton() {
        document.getElementById('submit-text').classList.remove('hidden');
        document.getElementById('submit-loader').classList.add('hidden');
        document.getElementById('modal-submit').disabled = false;
    },

    _updateCategorySuggestions() {
        const datalist = document.getElementById('categoria-suggestions');
        datalist.innerHTML = '';
        PromptManager.categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.name;
            datalist.appendChild(option);
        });
    }
};

// ============================================
// DELETE MODAL
// ============================================

const DeleteModal = {
    overlay: null,
    promptToDelete: null,

    init() {
        this.overlay = document.getElementById('delete-overlay');
        document.getElementById('delete-close').addEventListener('click', () => this.close());
        document.getElementById('delete-cancel').addEventListener('click', () => this.close());
        document.getElementById('delete-confirm').addEventListener('click', () => this.confirm());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });
    },

    open(prompt) {
        this.promptToDelete = prompt;
        document.getElementById('delete-prompt-name').textContent = `"${prompt.nombre}"`;
        this.overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    },

    close() {
        this.overlay.classList.add('hidden');
        this.promptToDelete = null;
        document.body.style.overflow = '';
        this._resetButton();
    },

    async confirm() {
        if (!this.promptToDelete) return;

        this._setLoading(true);

        try {
            const result = await ApiService.post('delete', { id: this.promptToDelete.id });

            if (result.success) {
                ToastManager.success('Prompt eliminado exitosamente');
                this.close();
                await PromptManager.loadAll();
            } else {
                ToastManager.error(result.message || 'Error al eliminar el prompt');
            }
        } catch (error) {
            ToastManager.error(error.message);
        } finally {
            this._setLoading(false);
        }
    },

    _setLoading(loading) {
        const textEl = document.getElementById('delete-text');
        const loaderEl = document.getElementById('delete-loader');
        const confirmBtn = document.getElementById('delete-confirm');

        if (loading) {
            textEl.classList.add('hidden');
            loaderEl.classList.remove('hidden');
            confirmBtn.disabled = true;
        } else {
            this._resetButton();
        }
    },

    _resetButton() {
        document.getElementById('delete-text').classList.remove('hidden');
        document.getElementById('delete-loader').classList.add('hidden');
        document.getElementById('delete-confirm').disabled = false;
    }
};

// ============================================
// DETAIL MODAL
// ============================================

const DetailModal = {
    overlay: null,
    currentPrompt: null,

    init() {
        this.overlay = document.getElementById('detail-overlay');
        document.getElementById('detail-close').addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });

        document.getElementById('copy-prompt').addEventListener('click', () => this.copyPrompt());
        document.getElementById('detail-edit').addEventListener('click', () => {
            this.close();
            ModalManager.openEdit(this.currentPrompt);
        });
        document.getElementById('detail-delete').addEventListener('click', () => {
            this.close();
            DeleteModal.open(this.currentPrompt);
        });
    },

    open(prompt) {
        this.currentPrompt = prompt;

        document.getElementById('detail-category').textContent = prompt.categoria;
        document.getElementById('detail-title').textContent = prompt.nombre;
        document.getElementById('detail-prompt').textContent = prompt.prompt;

        const dateFormatted = PromptManager._formatDate(prompt.fecha);
        const dateEl = document.getElementById('detail-date');
        if (dateEl) {
            dateEl.textContent = dateFormatted ? `Creado: ${dateFormatted}` : '';
        }

        const examplesSection = document.getElementById('detail-examples-section');
        const examplesContent = document.getElementById('detail-examples');

        if (prompt.ejemplos && prompt.ejemplos.trim()) {
            examplesContent.textContent = prompt.ejemplos;
            examplesSection.classList.remove('hidden');
        } else {
            examplesSection.classList.add('hidden');
        }

        this.overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    },

    close() {
        this.overlay.classList.add('hidden');
        this.currentPrompt = null;
        document.body.style.overflow = '';
    },

    async copyPrompt() {
        if (!this.currentPrompt) return;

        try {
            await navigator.clipboard.writeText(this.currentPrompt.prompt);
            ToastManager.success('Prompt copiado al portapapeles');

            // Visual feedback
            const btn = document.getElementById('copy-prompt');
            const original = btn.innerHTML;
            btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> ¡Copiado!';
            setTimeout(() => { btn.innerHTML = original; }, 2000);
        } catch {
            ToastManager.error('No se pudo copiar. Intentá seleccionar el texto manualmente.');
        }
    }
};

// ============================================
// PROMPT MANAGER
// ============================================

const PromptManager = {
    prompts: [],
    categories: [],
    activeCategory: null,
    searchQuery: '',

    init() {
        // Search
        const searchInput = document.getElementById('search-input');
        const searchClear = document.getElementById('search-clear');

        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.trim().toLowerCase();
            searchClear.classList.toggle('hidden', !this.searchQuery);
            this.render();
        });

        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            this.searchQuery = '';
            searchClear.classList.add('hidden');
            this.render();
        });

        // Clear filter
        document.getElementById('clear-filter').addEventListener('click', () => {
            this.setActiveCategory(null);
        });

        // Initial load
        this.loadAll();
    },

    async loadAll() {
        try {
            const [promptsRes, categoriesRes] = await Promise.all([
                ApiService.get('getAll'),
                ApiService.get('getCategories')
            ]);

            if (promptsRes.success) {
                this.prompts = promptsRes.data;
            }

            if (categoriesRes.success) {
                this.categories = categoriesRes.data;
            }

            this.renderCategories();
            this.render();
        } catch (error) {
            ToastManager.error(error.message);
            this.render();
        }
    },

    setActiveCategory(categoryName) {
        this.activeCategory = categoryName;

        // Update active state
        document.querySelectorAll('.category-chip').forEach(chip => {
            const isAll = chip.dataset.category === '__all__';
            const isActive = categoryName === null ? isAll : chip.dataset.category === categoryName;
            chip.classList.toggle('category-chip--active', isActive);
        });

        // Update filter badge
        const filterEl = document.getElementById('active-filter');
        const filterText = document.getElementById('active-filter-text');

        if (categoryName) {
            filterText.textContent = categoryName;
            filterEl.classList.remove('hidden');
        } else {
            filterEl.classList.add('hidden');
        }

        this.render();
    },

    getFilteredPrompts() {
        let filtered = [...this.prompts];

        // Filter by category
        if (this.activeCategory) {
            filtered = filtered.filter(p => p.categoria === this.activeCategory);
        }

        // Filter by search
        if (this.searchQuery) {
            filtered = filtered.filter(p =>
                p.nombre.toLowerCase().includes(this.searchQuery) ||
                p.prompt.toLowerCase().includes(this.searchQuery) ||
                p.categoria.toLowerCase().includes(this.searchQuery) ||
                p.ejemplos.toLowerCase().includes(this.searchQuery)
            );
        }

        return filtered;
    },

    renderCategories() {
        const container = document.getElementById('categories-list');
        const totalCount = this.prompts.length;

        let html = `
            <button class="category-chip category-chip--all category-chip--active" data-category="__all__">
                <span>Todos</span>
                <span class="category-chip__count">${totalCount}</span>
            </button>
        `;

        this.categories.forEach(cat => {
            html += `
                <button class="category-chip" data-category="${this._escapeHtml(cat.name)}">
                    <span>${this._escapeHtml(cat.name)}</span>
                    <span class="category-chip__count">${cat.count}</span>
                </button>
            `;
        });

        container.innerHTML = html;

        // Event listeners
        container.querySelectorAll('.category-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const cat = chip.dataset.category;
                this.setActiveCategory(cat === '__all__' ? null : cat);
            });
        });
    },

    render() {
        const grid = document.getElementById('prompt-grid');
        const emptyState = document.getElementById('empty-state');
        const countEl = document.getElementById('prompt-count');
        const filtered = this.getFilteredPrompts();

        if (filtered.length === 0) {
            grid.classList.add('hidden');
            emptyState.classList.remove('hidden');

            if (this.prompts.length === 0) {
                document.getElementById('empty-state-title').textContent = 'No hay prompts todavía';
                document.getElementById('empty-state-text').textContent = 'Creá tu primer prompt para comenzar a organizar tu colección.';
            } else {
                document.getElementById('empty-state-title').textContent = 'Sin resultados';
                document.getElementById('empty-state-text').textContent = 'No se encontraron prompts con los filtros actuales. Probá con otra búsqueda o categoría.';
            }

            countEl.textContent = `0 de ${this.prompts.length} prompts`;
            return;
        }

        emptyState.classList.add('hidden');
        grid.classList.remove('hidden');

        countEl.textContent = filtered.length === this.prompts.length
            ? `${this.prompts.length} prompt${this.prompts.length !== 1 ? 's' : ''}`
            : `${filtered.length} de ${this.prompts.length} prompts`;

        grid.innerHTML = filtered.map(prompt => this._renderCard(prompt)).join('');

        // Card events
        grid.querySelectorAll('.prompt-card').forEach(card => {
            const id = card.dataset.id;
            const prompt = this.prompts.find(p => p.id === id);

            card.addEventListener('click', (e) => {
                if (e.target.closest('.prompt-card__action')) return;
                DetailModal.open(prompt);
            });

            const editBtn = card.querySelector('.prompt-card__action--edit');
            const deleteBtn = card.querySelector('.prompt-card__action--delete');

            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    ModalManager.openEdit(prompt);
                });
            }

            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    DeleteModal.open(prompt);
                });
            }
        });
    },

    _renderCard(prompt) {
        const hasExamples = prompt.ejemplos && prompt.ejemplos.trim();
        const previewText = prompt.prompt.length > 150
            ? prompt.prompt.substring(0, 150) + '...'
            : prompt.prompt;
        const dateFormatted = this._formatDate(prompt.fecha);

        return `
            <article class="prompt-card" data-id="${this._escapeHtml(prompt.id)}">
                <div class="prompt-card__header">
                    <span class="prompt-card__category">${this._escapeHtml(prompt.categoria)}</span>
                    <div class="prompt-card__actions">
                        <button class="prompt-card__action prompt-card__action--edit" title="Editar" aria-label="Editar prompt">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="prompt-card__action prompt-card__action--delete" title="Eliminar" aria-label="Eliminar prompt">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <h3 class="prompt-card__name">${this._escapeHtml(prompt.nombre)}</h3>
                <p class="prompt-card__preview">${this._escapeHtml(previewText)}</p>
                <div class="prompt-card__footer">
                    <div class="prompt-card__footer-left" style="display: flex; flex-direction: column; gap: var(--space-xs); align-items: flex-start;">
                        ${hasExamples
                ? `<span class="prompt-card__has-examples">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                    Con ejemplos
                                </span>`
                : ''
            }
                        ${dateFormatted
                ? `<span class="prompt-card__date" style="font-size: var(--font-size-xs); color: var(--text-tertiary); font-weight: 500;">
                                    Creado: ${dateFormatted}
                                </span>`
                : ''
            }
                    </div>
                    <span class="prompt-card__view">Ver detalle →</span>
                </div>
            </article>
        `;
    },

    _formatDate(dateStr) {
        if (!dateStr) return '';
        try {
            // Reemplazar guiones por barras diagonales si viene de formato "yyyy-MM-dd HH:mm:ss"
            // para compatibilidad en algunos navegadores al parsear
            const cleanDateStr = dateStr.replace(/-/g, '/');
            const date = new Date(cleanDateStr);
            if (isNaN(date.getTime())) {
                // Probar parseo directo si falló con reemplazo
                const directDate = new Date(dateStr);
                if (isNaN(directDate.getTime())) return '';
                const day = String(directDate.getDate()).padStart(2, '0');
                const month = String(directDate.getMonth() + 1).padStart(2, '0');
                const year = directDate.getFullYear();
                return `${day}/${month}/${year}`;
            }
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch (e) {
            return '';
        }
    },

    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    ToastManager.init();
    ModalManager.init();
    DeleteModal.init();
    DetailModal.init();
    PromptManager.init();

    // Show API config notice if not configured
    if (!ApiService.isConfigured()) {
        ToastManager.info('Modo demo: Los datos se almacenan localmente. Configurá la API para conectar con Google Sheets.');
    }
});
