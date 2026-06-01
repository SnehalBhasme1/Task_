// ===== TOAST NOTIFICATION =====
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => { toast.className = 'toast'; }, 3200);
}

// ===== VALIDATION HELPER =====
function validateField(id) {
    const el = document.getElementById(id);
    if (!el) return true;
    const valid = el.value.trim() !== '';
    el.classList.toggle('error', !valid);
    return valid;
}

function clearErrors(...ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('error');
    });
}

// ===== REGISTER =====
async function register() {
    clearErrors('name', 'email', 'password');

    const nameOk     = validateField('name');
    const emailOk    = validateField('email');
    const passwordOk = validateField('password');

    if (!nameOk || !emailOk || !passwordOk) {
        showToast('Please fill in all fields.', 'error');
        return;
    }

    const btn = document.getElementById('registerBtn');
    btn.textContent = 'Creating account…';
    btn.disabled = true;

    try {
        const user = {
            name:     document.getElementById('name').value.trim(),
            email:    document.getElementById('email').value.trim(),
            password: document.getElementById('password').value
        };

        const response = await fetch('http://localhost:8080/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        const data = await response.text();

        if (response.ok) {
            showToast('Account created! Redirecting…', 'success');
            setTimeout(() => { window.location.href = 'login.html'; }, 1400);
        } else {
            showToast(data || 'Registration failed.', 'error');
            btn.textContent = 'Create Account';
            btn.disabled = false;
        }

    } catch (error) {
        console.error(error);
        showToast('Could not connect to server.', 'error');
        btn.textContent = 'Create Account';
        btn.disabled = false;
    }
}

// ===== LOGIN =====
async function login() {
    clearErrors('loginEmail', 'loginPassword');

    const emailOk    = validateField('loginEmail');
    const passwordOk = validateField('loginPassword');

    if (!emailOk || !passwordOk) {
        showToast('Please fill in all fields.', 'error');
        return;
    }

    const btn = document.getElementById('loginBtn');
    btn.textContent = 'Signing in…';
    btn.disabled = true;

    try {
        const loginData = {
            email:    document.getElementById('loginEmail').value.trim(),
            password: document.getElementById('loginPassword').value
        };

        const response = await fetch('http://localhost:8080/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });

        const data = await response.text();

        if (response.ok && data.trim() === 'Login Successful') {
            showToast('Welcome back!', 'success');
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
        } else {
            showToast(data || 'Invalid credentials.', 'error');
            btn.textContent = 'Sign In';
            btn.disabled = false;
        }

    } catch (error) {
        console.error(error);
        showToast('Could not connect to server.', 'error');
        btn.textContent = 'Sign In';
        btn.disabled = false;
    }
}

// ===== CREATE TASK =====
async function createTask() {
    clearErrors('title', 'description');

    const titleOk = validateField('title');
    const descOk  = validateField('description');

    if (!titleOk || !descOk) {
        showToast('Please fill in task title and description.', 'error');
        return;
    }

    const btn = document.querySelector('.btn-create');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin" style="font-size:12px;"></i> Adding…';
    btn.disabled = true;

    try {
        const task = {
            title:       document.getElementById('title').value.trim(),
            description: document.getElementById('description').value.trim(),
            status:      document.getElementById('status').value
        };

        await fetch('http://localhost:8080/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });

        document.getElementById('title').value = '';
        document.getElementById('description').value = '';
        document.getElementById('status').value = 'Todo';

        showToast('Task created!', 'success');
        await loadTasks();

    } catch (error) {
        console.error(error);
        showToast('Failed to create task.', 'error');
    } finally {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

// ===== LOAD TASKS =====
async function loadTasks() {
    try {
        const response = await fetch('http://localhost:8080/tasks');
        const tasks = await response.json();

        let todoHTML = '';
        let progressHTML = '';
        let doneHTML = '';

        let todoCount = 0, progressCount = 0, doneCount = 0;

        tasks.forEach(task => {
            const isDone = task.status === 'Done';
            const card = `
                <div class="task-card">
                    <div class="task-title">${escapeHTML(task.title)}</div>
                    <div class="task-desc">${escapeHTML(task.description)}</div>
                    <div class="task-actions">
                        <button class="btn-move" onclick="updateStatus(${task.id})" ${isDone ? 'disabled' : ''}>
                            <i class="fas fa-arrow-right" style="font-size:11px;"></i>
                            Move Next
                        </button>
                        <button class="btn-delete" onclick="deleteTask(${task.id})" title="Delete task">
                            <i class="fas fa-trash-alt" style="font-size:11px;"></i>
                        </button>
                    </div>
                </div>
            `;

            if (task.status === 'Todo') {
                todoHTML += card;
                todoCount++;
            } else if (task.status === 'In Progress') {
                progressHTML += card;
                progressCount++;
            } else if (task.status === 'Done') {
                doneHTML += card;
                doneCount++;
            }
        });

        const emptyState = (label) => `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                No ${label} tasks
            </div>
        `;

        document.getElementById('todoTasks').innerHTML      = todoHTML      || emptyState('todo');
        document.getElementById('inProgressTasks').innerHTML = progressHTML || emptyState('in-progress');
        document.getElementById('doneTasks').innerHTML      = doneHTML      || emptyState('completed');

        // Update badges
        document.getElementById('todoCount').textContent     = todoCount;
        document.getElementById('progressCount').textContent = progressCount;
        document.getElementById('doneCount').textContent     = doneCount;

        const total = todoCount + progressCount + doneCount;
        const totalEl = document.getElementById('totalCount');
        if (totalEl) totalEl.textContent = `${total} task${total !== 1 ? 's' : ''}`;

    } catch (error) {
        console.error(error);
        ['todoTasks', 'inProgressTasks', 'doneTasks'].forEach(id => {
            document.getElementById(id).innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    Could not load tasks
                </div>
            `;
        });
    }
}

// ===== DELETE TASK =====
async function deleteTask(id) {
    try {
        await fetch(`http://localhost:8080/tasks/${id}`, { method: 'DELETE' });
        showToast('Task deleted.', 'info');
        await loadTasks();
    } catch (error) {
        console.error(error);
        showToast('Failed to delete task.', 'error');
    }
}

// ===== UPDATE STATUS =====
async function updateStatus(id) {
    try {
        const response = await fetch('http://localhost:8080/tasks');
        const tasks = await response.json();
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        if (task.status === 'Todo') {
            task.status = 'In Progress';
        } else if (task.status === 'In Progress') {
            task.status = 'Done';
        } else {
            return;
        }

        await fetch(`http://localhost:8080/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });

        showToast(`Moved to "${task.status}"`, 'success');
        await loadTasks();

    } catch (error) {
        console.error(error);
        showToast('Failed to update task.', 'error');
    }
}

// ===== LOGOUT =====
function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// ===== UTILITY =====
function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ===== ENTER KEY SUPPORT =====
document.addEventListener('DOMContentLoaded', () => {
    const loginPassword = document.getElementById('loginPassword');
    if (loginPassword) loginPassword.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });

    const password = document.getElementById('password');
    if (password) password.addEventListener('keydown', e => { if (e.key === 'Enter') register(); });

    if (document.getElementById('todoTasks')) loadTasks();
});
