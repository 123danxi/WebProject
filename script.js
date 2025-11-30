// 任务类定义
class Task {
    constructor(id, title, description, category, priority, deadline, completed = false) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.priority = priority;
        this.deadline = deadline;
        this.completed = completed;
        this.createdAt = new Date().toISOString();
    }
}

// 应用主类
class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.currentCategory = 'all';
        this.currentSort = 'created';
        this.searchTerm = '';
        
        this.initializeElements();
        this.bindEvents();
        this.renderTasks();
    }

    initializeElements() {
        // 输入元素
        this.taskTitleInput = document.getElementById('taskTitle');
        this.taskDescriptionInput = document.getElementById('taskDescription');
        this.taskCategorySelect = document.getElementById('taskCategory');
        this.taskPrioritySelect = document.getElementById('taskPriority');
        this.taskDeadlineInput = document.getElementById('taskDeadline');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        
        // 搜索元素
        this.searchInput = document.getElementById('searchInput');
        this.clearSearchBtn = document.getElementById('clearSearch');
        
        // 过滤和排序元素
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.categoryButtons = document.querySelectorAll('.category-btn');
        this.sortSelect = document.getElementById('sortBy');
        
        // 任务列表容器
        this.taskList = document.getElementById('taskList');
    }

    bindEvents() {
        // 添加任务
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskTitleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // 搜索
        this.searchInput.addEventListener('input', () => this.handleSearch());
        this.clearSearchBtn.addEventListener('click', () => this.clearSearch());

        // 过滤
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', () => this.setFilter(btn.dataset.filter));
        });
        
        this.categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => this.setCategory(btn.dataset.category));
        });

        // 排序
        this.sortSelect.addEventListener('change', () => this.setSort(this.sortSelect.value));
    }

    addTask() {
        const title = this.taskTitleInput.value.trim();
        if (!title) {
            alert('请输入任务标题');
            return;
        }

        const task = new Task(
            Date.now().toString(),
            title,
            this.taskDescriptionInput.value.trim(),
            this.taskCategorySelect.value,
            this.taskPrioritySelect.value,
            this.taskDeadlineInput.value || null
        );

        this.tasks.push(task);
        this.saveTasks();
        
        // 清空输入
        this.taskTitleInput.value = '';
        this.taskDescriptionInput.value = '';
        this.taskDeadlineInput.value = '';
        
        this.renderTasks();
    }

    deleteTask(taskId) {
        if (confirm('确定要删除这个任务吗？')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.renderTasks();
        }
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const newTitle = prompt('编辑任务标题:', task.title);
        if (newTitle !== null && newTitle.trim()) {
            task.title = newTitle.trim();
            
            const newDescription = prompt('编辑任务描述:', task.description || '');
            task.description = newDescription || '';
            
            this.saveTasks();
            this.renderTasks();
        }
    }

    handleSearch() {
        this.searchTerm = this.searchInput.value.toLowerCase();
        this.renderTasks();
    }

    clearSearch() {
        this.searchInput.value = '';
        this.searchTerm = '';
        this.renderTasks();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.renderTasks();
    }

    setCategory(category) {
        this.currentCategory = category;
        this.categoryButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        this.renderTasks();
    }

    setSort(sortBy) {
        this.currentSort = sortBy;
        this.renderTasks();
    }

    getFilteredTasks() {
        let filteredTasks = [...this.tasks];

        // 状态过滤
        if (this.currentFilter === 'pending') {
            filteredTasks = filteredTasks.filter(task => !task.completed);
        } else if (this.currentFilter === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.completed);
        }

        // 分类过滤
        if (this.currentCategory !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.category === this.currentCategory);
        }

        // 搜索过滤
        if (this.searchTerm) {
            filteredTasks = filteredTasks.filter(task => 
                task.title.toLowerCase().includes(this.searchTerm) ||
                (task.description && task.description.toLowerCase().includes(this.searchTerm))
            );
        }

        // 排序
        filteredTasks.sort((a, b) => {
            switch (this.currentSort) {
                case 'deadline':
                    if (!a.deadline && !b.deadline) return 0;
                    if (!a.deadline) return 1;
                    if (!b.deadline) return -1;
                    return new Date(a.deadline) - new Date(b.deadline);
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'created':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        return filteredTasks;
    }

    renderTasks() {
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            this.taskList.innerHTML = `
                <div class="empty-state">
                    <h3>暂无任务</h3>
                    <p>${this.searchTerm ? '没有找到匹配的任务' : '添加一个新任务开始使用吧！'}</p>
                </div>
            `;
            return;
        }

        this.taskList.innerHTML = filteredTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="app.toggleTask('${task.id}')">
                
                <div class="task-content">
                    <div class="task-title">
                        ${task.title}
                        ${task.deadline ? `<span class="deadline-badge">${this.formatDeadline(task.deadline)}</span>` : ''}
                    </div>
                    ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                    <div class="task-meta">
                        <span class="task-category ${task.category}">${this.getCategoryName(task.category)}</span>
                        <span class="task-priority ${task.priority}">${this.getPriorityName(task.priority)}</span>
                        <span>创建时间: ${this.formatDate(task.createdAt)}</span>
                    </div>
                </div>
                
                <div class="task-actions">
                    <button class="edit-btn" onclick="app.editTask('${task.id}')">编辑</button>
                    <button class="delete-btn" onclick="app.deleteTask('${task.id}')">删除</button>
                </div>
            </div>
        `).join('');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN');
    }

    formatDeadline(deadline) {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return `已过期 ${Math.abs(diffDays)} 天`;
        } else if (diffDays === 0) {
            return '今天到期';
        } else if (diffDays === 1) {
            return '明天到期';
        } else {
            return `${diffDays} 天后到期`;
        }
    }

    getCategoryName(category) {
        const names = {
            work: '工作',
            study: '学习',
            life: '生活'
        };
        return names[category] || category;
    }

    getPriorityName(priority) {
        const names = {
            low: '低',
            medium: '中',
            high: '高'
        };
        return names[priority] || priority;
    }

    saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const saved = localStorage.getItem('todoTasks');
        return saved ? JSON.parse(saved) : [];
    }
}

// 初始化应用
const app = new TodoApp();
