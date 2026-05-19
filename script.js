/**
 * Kanban Board Task Manager Application
 * 
 * A modern task management app with drag-and-drop, modal dialogs,
 * toast notifications, and localStorage persistence.
 * 
 * @module KanbanBoard
 */

(function() {
    'use strict';

    // ==========================================================================
    // State Management
    // ==========================================================================
    
    /** @type {Object.<string, Array<{id: number, text: string, createdAt: number}>} */
    const state = {
        todo: [],
        inProgress: [],
        done: [],
        deleted: []
    };

    /** @type {number} Unique ID counter for tasks */
    let taskIdCounter = Date.now();

    // ==========================================================================
    // DOM Elements Cache
    // ==========================================================================
    
    const elements = {};

    /**
     * Initialize DOM element references
     */
    function cacheElements() {
        elements.addBtn = document.getElementById('addBtn');
        elements.modalOverlay = document.getElementById('modalOverlay');
        elements.modalClose = document.getElementById('modalClose');
        elements.modalCancel = document.getElementById('modalCancel');
        elements.taskForm = document.getElementById('taskForm');
        elements.taskId = document.getElementById('taskId');
        elements.taskText = document.getElementById('taskText');
        elements.modalTitle = document.getElementById('modalTitle');
        elements.modalSubmitText = document.getElementById('modalSubmitText');
        elements.toastContainer = document.getElementById('toastContainer');
        
        // Column elements
        elements.columns = {
            todo: document.getElementById('todo'),
            inProgress: document.getElementById('inProgress'),
            done: document.getElementById('done'),
            deleted: document.getElementById('deleted')
        };
        
        // Column count elements
        elements.counts = {
            todo: document.querySelector('.column--todo .column__count'),
            inProgress: document.querySelector('.column--in-progress .column__count'),
            done: document.querySelector('.column--done .column__count'),
            deleted: document.querySelector('.column--deleted .column__count')
        };
    }

    // ==========================================================================
    // LocalStorage Helpers
    // ==========================================================================
    
    const STORAGE_KEY = 'kanban_tasks';

    /**
     * Safely parse JSON from localStorage
     * @returns {Object} Parsed data or empty object
     */
    function getFromStorage() {
        try {
            const item = localStorage.getItem(STORAGE_KEY);
            if (!item) return null;
            return JSON.parse(item);
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }

    /**
     * Safely stringify and save to localStorage
     * @param {Object} data - Data to store
     */
    function saveToStorage(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            showToast('Ошибка сохранения данных', 'error');
        }
    }

    /**
     * Load all task arrays from localStorage
     */
    function loadTasks() {
        const savedData = getFromStorage();
        
        if (savedData) {
            state.todo = savedData.todo || [];
            state.inProgress = savedData.inProgress || [];
            state.done = savedData.done || [];
            state.deleted = savedData.deleted || [];
            
            // Update ID counter to avoid duplicates
            const allTasks = [...state.todo, ...state.inProgress, ...state.done, ...state.deleted];
            if (allTasks.length > 0) {
                taskIdCounter = Math.max(...allTasks.map(t => t.id)) + 1;
            }
        }
    }

    /**
     * Save current state to localStorage
     */
    function persistState() {
        saveToStorage({
            todo: state.todo,
            inProgress: state.inProgress,
            done: state.done,
            deleted: state.deleted
        });
    }

    // ==========================================================================
    // Toast Notifications
    // ==========================================================================
    
    /**
     * Show a toast notification
     * @param {string} message - Message to display
     * @param {string} type - Type: 'success', 'error', 'warning', 'info'
     */
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;
        
        elements.toastContainer.appendChild(toast);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.25s ease-out reverse';
            setTimeout(() => toast.remove(), 250);
        }, 3000);
    }

    // ==========================================================================
    // Modal Functions
    // ==========================================================================
    
    /**
     * Open the modal for adding/editing a task
     * @param {number|null} taskId - Task ID for editing, null for adding
     * @param {string|null} taskText - Current task text for editing
     */
    function openModal(taskId = null, taskText = null) {
        elements.taskId.value = taskId || '';
        elements.taskText.value = taskText || '';
        elements.modalTitle.textContent = taskId ? 'Редактировать задачу' : 'Добавить задачу';
        elements.modalSubmitText.textContent = taskId ? 'Обновить' : 'Сохранить';
        elements.modalOverlay.hidden = false;
        elements.taskText.focus();
    }

    /**
     * Close the modal
     */
    function closeModal() {
        elements.modalOverlay.hidden = true;
        elements.taskForm.reset();
        elements.taskId.value = '';
    }

    // ==========================================================================
    // UI Rendering
    // ==========================================================================
    
    /**
     * Create a task card element
     * @param {Object} task - Task object
     * @param {string} status - Current status/column
     * @returns {HTMLElement} Task card element
     */
    function createTaskCard(task, status) {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.draggable = status !== 'deleted';
        card.dataset.id = task.id;
        card.dataset.status = status;
        
        const text = document.createElement('p');
        text.className = 'task-card__text';
        text.textContent = task.text;
        
        const actions = document.createElement('div');
        actions.className = 'task-card__actions';
        
        if (status !== 'deleted') {
            const editBtn = document.createElement('button');
            editBtn.className = 'button button--secondary';
            editBtn.innerHTML = '<span class="button__icon">✏️</span>';
            editBtn.setAttribute('aria-label', 'Редактировать задачу');
            editBtn.type = 'button';
            editBtn.onclick = (e) => {
                e.stopPropagation();
                openModal(task.id, task.text);
            };
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'button button--danger';
            deleteBtn.innerHTML = '<span class="button__icon">🗑️</span>';
            deleteBtn.setAttribute('aria-label', 'Удалить задачу');
            deleteBtn.type = 'button';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                moveTask(task.id, status, 'deleted');
                showToast('Задача перемещена в удалённые', 'warning');
            };
            
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
        } else {
            const restoreBtn = document.createElement('button');
            restoreBtn.className = 'button button--success';
            restoreBtn.innerHTML = '<span class="button__icon">↩️</span>';
            restoreBtn.setAttribute('aria-label', 'Восстановить задачу');
            restoreBtn.type = 'button';
            restoreBtn.onclick = (e) => {
                e.stopPropagation();
                moveTask(task.id, 'deleted', 'todo');
                showToast('Задача восстановлена', 'success');
            };
            
            const permanentDeleteBtn = document.createElement('button');
            permanentDeleteBtn.className = 'button button--danger';
            permanentDeleteBtn.innerHTML = '<span class="button__icon">❌</span>';
            permanentDeleteBtn.setAttribute('aria-label', 'Удалить навсегда');
            permanentDeleteBtn.type = 'button';
            permanentDeleteBtn.onclick = (e) => {
                e.stopPropagation();
                deleteTaskPermanently(task.id);
                showToast('Задача удалена навсегда', 'error');
            };
            
            actions.appendChild(restoreBtn);
            actions.appendChild(permanentDeleteBtn);
        }
        
        card.appendChild(text);
        card.appendChild(actions);
        
        // Drag events
        if (status !== 'deleted') {
            card.addEventListener('dragstart', handleDragStart);
            card.addEventListener('dragend', handleDragEnd);
        }
        
        return card;
    }

    /**
     * Render all columns
     */
    function renderAllColumns() {
        renderColumn('todo', state.todo);
        renderColumn('inProgress', state.inProgress);
        renderColumn('done', state.done);
        renderColumn('deleted', state.deleted);
    }

    /**
     * Render a single column
     * @param {string} status - Column status
     * @param {Array} tasks - Tasks array
     */
    function renderColumn(status, tasks) {
        const column = elements.columns[status];
        const countEl = elements.counts[status];
        
        if (!column) return;
        
        column.innerHTML = '';
        
        if (countEl) {
            countEl.textContent = tasks.length;
        }
        
        if (!tasks || tasks.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.style.color = 'var(--color-text-muted)';
            emptyMsg.style.fontSize = 'var(--font-size-sm)';
            emptyMsg.style.textAlign = 'center';
            emptyMsg.style.padding = 'var(--spacing-md)';
            emptyMsg.textContent = 'Нет задач';
            column.appendChild(emptyMsg);
            return;
        }

        // Use DocumentFragment for batch DOM updates
        const fragment = document.createDocumentFragment();
        
        tasks.forEach(task => {
            const card = createTaskCard(task, status);
            fragment.appendChild(card);
        });
        
        column.appendChild(fragment);
    }

    // ==========================================================================
    // Task Operations
    // ==========================================================================
    
    /**
     * Find task by ID and return its status and index
     * @param {number} taskId - Task ID
     * @returns {Object|null} Object with status, index, and task, or null
     */
    function findTask(taskId) {
        for (const [status, tasks] of Object.entries(state)) {
            const index = tasks.findIndex(t => t.id === taskId);
            if (index !== -1) {
                return { status, index, task: tasks[index] };
            }
        }
        return null;
    }

    /**
     * Move task between columns
     * @param {number} taskId - Task ID
     * @param {string} fromStatus - Source status
     * @param {string} toStatus - Target status
     */
    function moveTask(taskId, fromStatus, toStatus) {
        const found = findTask(taskId);
        if (!found || found.status !== fromStatus) return;
        
        const [task] = state[fromStatus].splice(found.index, 1);
        state[toStatus].push(task);
        
        persistState();
        renderAllColumns();
    }

    /**
     * Delete task permanently
     * @param {number} taskId - Task ID
     */
    function deleteTaskPermanently(taskId) {
        const found = findTask(taskId);
        if (!found || found.status !== 'deleted') return;
        
        state.deleted.splice(found.index, 1);
        persistState();
        renderAllColumns();
    }

    /**
     * Add a new task
     * @param {string} text - Task text
     */
    function addTask(text) {
        const task = {
            id: taskIdCounter++,
            text: text.trim(),
            createdAt: Date.now()
        };
        
        state.todo.push(task);
        persistState();
        renderAllColumns();
        showToast('Задача создана', 'success');
    }

    /**
     * Update existing task
     * @param {number} taskId - Task ID
     * @param {string} newText - New task text
     */
    function updateTask(taskId, newText) {
        const found = findTask(taskId);
        if (!found) return;
        
        state[found.status][found.index].text = newText.trim();
        persistState();
        renderAllColumns();
        showToast('Задача обновлена', 'success');
    }

    // ==========================================================================
    // Drag and Drop
    // ==========================================================================
    
    let draggedElement = null;

    function handleDragStart(event) {
        draggedElement = event.target;
        event.target.classList.add('dragging');
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', event.target.dataset.id);
    }

    function handleDragEnd(event) {
        event.target.classList.remove('dragging');
        draggedElement = null;
        
        // Remove all drag-over classes
        document.querySelectorAll('.column__content').forEach(col => {
            col.classList.remove('drag-over');
        });
    }

    function handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        
        const column = event.target.closest('.column__content');
        if (column) {
            column.classList.add('drag-over');
        }
    }

    function handleDragLeave(event) {
        const column = event.target.closest('.column__content');
        if (column && !column.contains(event.relatedTarget)) {
            column.classList.remove('drag-over');
        }
    }

    function handleDrop(event) {
        event.preventDefault();
        
        const column = event.target.closest('.column__content');
        if (!column || !draggedElement) return;
        
        column.classList.remove('drag-over');
        
        const taskId = parseInt(draggedElement.dataset.id);
        const fromStatus = draggedElement.dataset.status;
        const toStatus = column.id;
        
        if (fromStatus !== toStatus) {
            moveTask(taskId, fromStatus, toStatus);
            
            const statusNames = {
                todo: 'Новые',
                inProgress: 'В работе',
                done: 'Готовые',
                deleted: 'Удалённые'
            };
            
            showToast(`Задача перемещена: ${statusNames[toStatus]}`, 'success');
        }
    }

    // ==========================================================================
    // Event Handlers
    // ==========================================================================
    
    function handleAddTask() {
        openModal(null, null);
    }

    function handleFormSubmit(event) {
        event.preventDefault();
        
        const taskId = elements.taskId.value;
        const taskText = elements.taskText.value.trim();
        
        if (!taskText) {
            showToast('Введите описание задачи', 'error');
            return;
        }
        
        if (taskId) {
            updateTask(parseInt(taskId), taskText);
        } else {
            addTask(taskText);
        }
        
        closeModal();
    }

    function handleModalClose() {
        closeModal();
    }

    function handleOverlayClick(event) {
        if (event.target === elements.modalOverlay) {
            closeModal();
        }
    }

    function handleEscapeKey(event) {
        if (event.key === 'Escape' && !elements.modalOverlay.hidden) {
            closeModal();
        }
    }

    // ==========================================================================
    // Event Binding
    // ==========================================================================
    
    function bindEvents() {
        // Add button
        elements.addBtn.addEventListener('click', handleAddTask);
        
        // Modal events
        elements.modalClose.addEventListener('click', handleModalClose);
        elements.modalCancel.addEventListener('click', handleModalClose);
        elements.taskForm.addEventListener('submit', handleFormSubmit);
        elements.modalOverlay.addEventListener('click', handleOverlayClick);
        document.addEventListener('keydown', handleEscapeKey);
        
        // Drag and drop on columns
        Object.values(elements.columns).forEach(column => {
            column.addEventListener('dragover', handleDragOver);
            column.addEventListener('dragleave', handleDragLeave);
            column.addEventListener('drop', handleDrop);
        });
    }

    // ==========================================================================
    // Initialization
    // ==========================================================================
    
    function init() {
        cacheElements();
        loadTasks();
        bindEvents();
        renderAllColumns();
    }

    // Start the app when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();