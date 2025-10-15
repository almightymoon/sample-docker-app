// API Base URL
const API_URL = '/api';

// State
let tasks = [];
let currentFilter = 'all';

// DOM Elements
const taskForm = document.getElementById('taskForm');
const editForm = document.getElementById('editForm');
const tasksGrid = document.getElementById('tasksGrid');
const emptyState = document.getElementById('emptyState');
const toast = document.getElementById('toast');
const modal = document.getElementById('editModal');
const modalClose = document.querySelector('.modal-close');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    setupEventListeners();
    animateOnScroll();
});

// Event Listeners
function setupEventListeners() {
    taskForm.addEventListener('submit', handleCreateTask);
    editForm.addEventListener('submit', handleUpdateTask);
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTasks();
        });
    });

    // Modal close
    modalClose.addEventListener('click', () => modal.classList.remove('show'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('show');
    });
}

// API Functions
async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        tasks = await response.json();
        renderTasks();
        updateStats();
    } catch (error) {
        showToast('Failed to load tasks', 'error');
        console.error('Error:', error);
    }
}

async function handleCreateTask(e) {
    e.preventDefault();
    
    const taskData = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        priority: document.getElementById('taskPriority').value,
        status: document.getElementById('taskStatus').value
    };

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) throw new Error('Failed to create task');
        
        const newTask = await response.json();
        tasks.unshift(newTask);
        renderTasks();
        updateStats();
        taskForm.reset();
        showToast('Task created successfully!');
    } catch (error) {
        showToast('Failed to create task', 'error');
        console.error('Error:', error);
    }
}

async function handleUpdateTask(e) {
    e.preventDefault();
    
    const taskId = document.getElementById('editTaskId').value;
    const taskData = {
        title: document.getElementById('editTaskTitle').value,
        description: document.getElementById('editTaskDescription').value,
        priority: document.getElementById('editTaskPriority').value,
        status: document.getElementById('editTaskStatus').value
    };

    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) throw new Error('Failed to update task');
        
        const updatedTask = await response.json();
        const index = tasks.findIndex(t => t.id === parseInt(taskId));
        if (index !== -1) tasks[index] = updatedTask;
        
        renderTasks();
        updateStats();
        modal.classList.remove('show');
        showToast('Task updated successfully!');
    } catch (error) {
        showToast('Failed to update task', 'error');
        console.error('Error:', error);
    }
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete task');
        
        tasks = tasks.filter(t => t.id !== taskId);
        renderTasks();
        updateStats();
        showToast('Task deleted successfully!');
    } catch (error) {
        showToast('Failed to delete task', 'error');
        console.error('Error:', error);
    }
}

// UI Functions
function renderTasks() {
    const filteredTasks = currentFilter === 'all' 
        ? tasks 
        : tasks.filter(task => task.status === currentFilter);

    if (filteredTasks.length === 0) {
        tasksGrid.style.display = 'none';
        emptyState.classList.add('show');
        return;
    }

    tasksGrid.style.display = 'grid';
    emptyState.classList.remove('show');

    tasksGrid.innerHTML = filteredTasks.map((task, index) => `
        <div class="task-card" style="animation-delay: ${index * 0.1}s">
            <div class="task-header">
                <div>
                    <h3 class="task-title">${escapeHtml(task.title)}</h3>
                    <p class="task-description">${escapeHtml(task.description || 'No description')}</p>
                </div>
            </div>
            <div class="task-meta">
                <span class="task-badge priority-${task.priority}">
                    ${getPriorityIcon(task.priority)} ${task.priority}
                </span>
                <span class="task-badge status-${task.status}">
                    ${getStatusIcon(task.status)} ${formatStatus(task.status)}
                </span>
            </div>
            <div class="task-actions">
                <button class="btn-icon btn-edit" onclick="editTask(${task.id})" title="Edit">
                    ✏️
                </button>
                <button class="btn-icon btn-delete" onclick="deleteTask(${task.id})" title="Delete">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');
}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editTaskTitle').value = task.title;
    document.getElementById('editTaskDescription').value = task.description || '';
    document.getElementById('editTaskPriority').value = task.priority;
    document.getElementById('editTaskStatus').value = task.status;

    modal.classList.add('show');
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;

    animateNumber('totalTasks', total);
    animateNumber('completedTasks', completed);
    animateNumber('pendingTasks', pending);
}

function animateNumber(elementId, targetValue) {
    const element = document.getElementById(elementId);
    const currentValue = parseInt(element.textContent) || 0;
    const increment = targetValue > currentValue ? 1 : -1;
    const duration = 500;
    const steps = Math.abs(targetValue - currentValue);
    const stepDuration = steps > 0 ? duration / steps : 0;

    let current = currentValue;
    const timer = setInterval(() => {
        current += increment;
        element.textContent = current;
        if (current === targetValue) clearInterval(timer);
    }, stepDuration);
}

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getPriorityIcon(priority) {
    const icons = { low: '🟢', medium: '🟡', high: '🔴' };
    return icons[priority] || '⚪';
}

function getStatusIcon(status) {
    const icons = { pending: '⏳', in_progress: '🔄', completed: '✅' };
    return icons[status] || '📋';
}

function formatStatus(status) {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Scroll Animations
function animateOnScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.task-card, .stat-card').forEach(el => {
        observer.observe(el);
    });
}

// Make functions global for inline onclick handlers
window.editTask = editTask;
window.deleteTask = deleteTask;

